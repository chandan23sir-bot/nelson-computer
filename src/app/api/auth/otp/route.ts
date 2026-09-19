import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomInt, randomUUID } from 'crypto';
import { db } from '@/lib/db';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashOtp(otp: string) {
  return createHash('sha256').update(otp).digest('hex');
}

function createSession(response: NextResponse, user: { id: string; name: string; email: string; loginType: 'student' }) {
  const sessionData = { ...user, sessionId: randomUUID() };
  const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  response.cookies.set('nelson_session', encodedSession, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/',
  });
}

async function sendOtpEmail(email: string, otp: string, purpose: 'register' | 'login') {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OTP_FROM_EMAIL || 'Nelson Computer Institute <onboarding@resend.dev>';
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Add it to your deployment environment.');
  }

  const subject = purpose === 'register' ? 'Your Nelson Institute registration OTP' : 'Your Nelson Institute login OTP';
  const title = purpose === 'register' ? 'Verify your email to create your account' : 'Sign in to your student account';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#0f172a">
      <div style="background:#0f172a;color:#fff;padding:22px;border-radius:16px 16px 0 0">
        <h2 style="margin:0">NELSON <span style="color:#f59e0b">COMPUTER</span> INSTITUTE</h2>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:0;padding:28px;border-radius:0 0 16px 16px">
        <h3>${title}</h3>
        <p>Your one-time password is:</p>
        <div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#f8fafc;padding:18px;text-align:center;border-radius:12px">${otp}</div>
        <p style="color:#64748b">This OTP expires in 10 minutes. Never share it with anyone.</p>
      </div>
    </div>`;

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject, html }),
  });
  if (!result.ok) {
    const body = await result.text();
    console.error('OTP email provider error:', body);
    throw new Error('Unable to send OTP email right now.');
  }
}

async function issueOtp(email: string, purpose: 'register' | 'login', payload?: Record<string, string>) {
  const now = new Date();
  const recent = await db.otpCode.findFirst({
    where: { email, purpose, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) {
    throw new Error('Please wait 60 seconds before requesting another OTP.');
  }

  await db.otpCode.deleteMany({ where: { email, purpose } });
  const otp = String(randomInt(100000, 1000000));
  await db.otpCode.create({
    data: {
      email,
      purpose,
      codeHash: hashOtp(otp),
      payload: payload ? JSON.stringify(payload) : null,
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    },
  });
  await sendOtpEmail(email, otp, purpose);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as 'register-start' | 'register-verify' | 'login-start' | 'login-verify';
    const email = normalizeEmail(body.email || '');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (action === 'register-start') {
      const { studentName, fatherName, mobile, courseId } = body;
      if (!studentName?.trim() || !fatherName?.trim() || !mobile?.trim()) {
        return NextResponse.json({ success: false, message: 'Name, father name and mobile are required.' }, { status: 400 });
      }
      const existing = await db.student.findFirst({ where: { email } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'This email is already registered. Please use Login with OTP.' }, { status: 409 });
      }
      if (courseId) {
        const course = await db.course.findUnique({ where: { id: courseId } });
        if (!course) return NextResponse.json({ success: false, message: 'Selected course was not found.' }, { status: 400 });
      }
      await issueOtp(email, 'register', {
        studentName: studentName.trim(), fatherName: fatherName.trim(), mobile: mobile.trim(), courseId: courseId || '',
      });
      return NextResponse.json({ success: true, message: 'OTP sent to your email.' });
    }

    if (action === 'register-verify') {
      const code = String(body.otp || '').trim();
      const record = await db.otpCode.findFirst({ where: { email, purpose: 'register' }, orderBy: { createdAt: 'desc' } });
      if (!record || record.expiresAt < new Date()) {
        return NextResponse.json({ success: false, message: 'OTP expired. Please request a new OTP.' }, { status: 400 });
      }
      if (record.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json({ success: false, message: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
      }
      if (hashOtp(code) !== record.codeHash) {
        await db.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
        return NextResponse.json({ success: false, message: 'Incorrect OTP.' }, { status: 400 });
      }
      const payload = record.payload ? JSON.parse(record.payload) : null;
      if (!payload) return NextResponse.json({ success: false, message: 'Registration data expired. Please register again.' }, { status: 400 });
      const password = randomUUID();
      const student = await db.student.create({
        data: {
          studentName: payload.studentName,
          fatherName: payload.fatherName,
          mobile: payload.mobile,
          email,
          courseId: payload.courseId || null,
          password,
        },
      });
      await db.otpCode.delete({ where: { id: record.id } });
      const response = NextResponse.json({ success: true, message: 'Registration successful.', user: { id: student.id, name: student.studentName, email: student.email, loginType: 'student' } });
      createSession(response, { id: student.id, name: student.studentName, email: student.email!, loginType: 'student' });
      return response;
    }

    if (action === 'login-start') {
      const student = await db.student.findFirst({ where: { email } });
      if (!student) return NextResponse.json({ success: false, message: 'No student account is registered with this email.' }, { status: 404 });
      if (student.status !== 'active') return NextResponse.json({ success: false, message: 'This student account is inactive. Please contact the institute.' }, { status: 403 });
      await issueOtp(email, 'login');
      return NextResponse.json({ success: true, message: 'Login OTP sent to your email.' });
    }

    if (action === 'login-verify') {
      const code = String(body.otp || '').trim();
      const record = await db.otpCode.findFirst({ where: { email, purpose: 'login' }, orderBy: { createdAt: 'desc' } });
      if (!record || record.expiresAt < new Date()) return NextResponse.json({ success: false, message: 'OTP expired. Please request a new OTP.' }, { status: 400 });
      if (record.attempts >= MAX_ATTEMPTS) return NextResponse.json({ success: false, message: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
      if (hashOtp(code) !== record.codeHash) {
        await db.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
        return NextResponse.json({ success: false, message: 'Incorrect OTP.' }, { status: 400 });
      }
      const student = await db.student.findFirst({ where: { email } });
      if (!student) return NextResponse.json({ success: false, message: 'Student account not found.' }, { status: 404 });
      await db.otpCode.delete({ where: { id: record.id } });
      const response = NextResponse.json({ success: true, message: 'Login successful.', user: { id: student.id, name: student.studentName, email: student.email, loginType: 'student' } });
      createSession(response, { id: student.id, name: student.studentName, email: student.email!, loginType: 'student' });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid OTP action.' }, { status: 400 });
  } catch (error) {
    console.error('OTP auth error:', error);
    const message = error instanceof Error ? error.message : 'Unable to process OTP request.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
