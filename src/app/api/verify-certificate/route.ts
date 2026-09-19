import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certNo = searchParams.get('certNo');

    if (!certNo) {
      return NextResponse.json(
        { success: false, message: 'certNo query parameter is required' },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: { certificateNo: certNo },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            fatherName: true,
            mobile: true,
            email: true,
            course: {
              select: {
                courseName: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        certificateNo: certificate.certificateNo,
        issuedDate: certificate.issuedDate,
        student: {
          name: certificate.student.studentName,
          fatherName: certificate.student.fatherName,
          mobile: certificate.student.mobile,
          email: certificate.student.email,
          courseName: certificate.student.course?.courseName ?? 'N/A',
        },
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
