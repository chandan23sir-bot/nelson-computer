import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateRandomPassword(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function GET() {
  try {
    const students = await db.student.findMany({
      include: {
        course: {
          select: { id: true, courseName: true },
        },
        branch: {
          select: { id: true, branchName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      fatherName,
      mobile,
      email,
      courseId,
      branchId,
      photo,
      password,
      admissionDate,
      status,
    } = body as {
      studentName: string;
      fatherName: string;
      mobile: string;
      email?: string;
      courseId?: string;
      branchId?: string;
      photo?: string;
      password?: string;
      admissionDate?: string;
      status?: string;
    };

    if (!studentName || !fatherName || !mobile) {
      return NextResponse.json(
        { success: false, message: 'studentName, fatherName, and mobile are required' },
        { status: 400 }
      );
    }

    const studentPassword = password || generateRandomPassword();

    const student = await db.student.create({
      data: {
        studentName,
        fatherName,
        mobile,
        email: email || null,
        courseId: courseId || null,
        branchId: branchId || null,
        photo: photo || null,
        password: studentPassword,
        admissionDate: admissionDate ? new Date(admissionDate) : undefined,
        status: status || 'active',
      },
      include: {
        course: {
          select: { id: true, courseName: true },
        },
        branch: {
          select: { id: true, branchName: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: student, generatedPassword: !password ? studentPassword : undefined },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
