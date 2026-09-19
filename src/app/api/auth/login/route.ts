import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, loginType } = body as {
      email: string;
      password: string;
      loginType: 'admin' | 'branch' | 'student';
    };

    if (!email || !password || !loginType) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and loginType are required' },
        { status: 400 }
      );
    }

    let user: { id: string; name: string; email: string | null } | null = null;

    if (loginType === 'admin') {
      const admin = await db.admin.findUnique({ where: { email } });
      if (admin && admin.password === password) {
        user = { id: admin.id, name: admin.name, email: admin.email };
      }
    } else if (loginType === 'branch') {
      const branch = await db.branch.findUnique({ where: { email } });
      if (branch && branch.password === password) {
        user = { id: branch.id, name: branch.ownerName, email: branch.email };
      }
    } else if (loginType === 'student') {
      // Students may login with mobile or email
      const student = await db.student.findFirst({
        where: {
          OR: [{ email }, { mobile: email }],
        },
      });
      if (student && student.password === password) {
        user = { id: student.id, name: student.studentName, email: student.email };
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid loginType' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginType,
    };

    const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: sessionData,
    });

    response.cookies.set('nelson_session', encodedSession, {
      httpOnly: true,
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
