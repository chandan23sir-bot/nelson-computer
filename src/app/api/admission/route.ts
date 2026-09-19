import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BREVO_API_KEY = 'fc517f71-c05e-468a-9525-aee4a9b434f0';
const NELSON_EMAIL = 'info@nelsoncomputerinstitute.com';
const NELSON_MOBILES = ['8707599763', '9792121300'];

async function sendAdmissionEmail(data: {
  studentName: string;
  fatherName: string;
  mobile: string;
  email?: string;
  course: string;
  message?: string;
}) {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #f59e0b; margin: 0;">NELSON COMPUTER INSTITUTE</h1>
          <p style="color: #94a3b8; margin: 5px 0 0;">New Admission Inquiry</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b;">New Student Inquiry Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Student Name:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${data.studentName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Father Name:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${data.fatherName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Mobile:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;"><a href="tel:${data.mobile}" style="color: #f59e0b;">${data.mobile}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${data.email || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Course:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: bold;">${data.course}</td></tr>
            ${data.message ? `<tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Message:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${data.message}</td></tr>` : ''}
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">📞 Contact Student: <a href="tel:${data.mobile}" style="color: #92400e;">${data.mobile}</a></p>
            <p style="margin: 5px 0 0; color: #92400e;">Institute Helpline: ${NELSON_MOBILES.join(' | ')}</p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">© 2025 Nelson Computer Institute. All Rights Reserved.</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: 'Nelson Computer Institute',
          email: 'noreply@nelsoncomputerinstitute.com',
        },
        to: [
          { email: NELSON_EMAIL, name: 'Nelson Admin' },
        ],
        subject: `New Admission Inquiry - ${data.studentName} (${data.course})`,
        htmlContent: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', response.status, errorText);
    } else {
      console.log('✅ Admission email sent successfully to', NELSON_EMAIL);
    }
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export async function GET() {
  try {
    const inquiries = await db.admissionInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Get admission inquiries error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, fatherName, mobile, email, course, message } = body as {
      studentName: string;
      fatherName: string;
      mobile: string;
      email?: string;
      course: string;
      message?: string;
    };

    if (!studentName || !fatherName || !mobile || !course) {
      return NextResponse.json(
        { success: false, message: 'studentName, fatherName, mobile, and course are required' },
        { status: 400 }
      );
    }

    const inquiry = await db.admissionInquiry.create({
      data: {
        studentName,
        fatherName,
        mobile,
        email: email || null,
        course,
        message: message || null,
        status: 'pending',
      },
    });

    // Send email notification to institute (non-blocking)
    sendAdmissionEmail({ studentName, fatherName, mobile, email, course, message });

    return NextResponse.json(
      {
        success: true,
        message: 'Admission inquiry submitted successfully! We will contact you soon.',
        data: inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admission inquiry error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
