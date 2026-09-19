import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateCertificateNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `NCI-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: { studentId?: string } = {};
    if (studentId) {
      where.studentId = studentId;
    }

    const certificates = await db.certificate.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            fatherName: true,
            mobile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, issuedDate, qrCode } = body as {
      studentId: string;
      issuedDate?: string;
      qrCode?: string;
    };

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'studentId is required' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Generate unique certificate number
    let certificateNo = generateCertificateNo();
    let existing = await db.certificate.findUnique({ where: { certificateNo } });
    while (existing) {
      certificateNo = generateCertificateNo();
      existing = await db.certificate.findUnique({ where: { certificateNo } });
    }

    const certificate = await db.certificate.create({
      data: {
        studentId,
        certificateNo,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        qrCode: qrCode || null,
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            fatherName: true,
            mobile: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: certificate }, { status: 201 });
  } catch (error) {
    console.error('Create certificate error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
