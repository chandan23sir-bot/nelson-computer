import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        course: true,
        branch: true,
        fees: {
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          orderBy: { date: 'desc' },
        },
        results: {
          include: {
            exam: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingStudent = await db.student.findUnique({ where: { id } });
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'studentName',
      'fatherName',
      'mobile',
      'email',
      'courseId',
      'branchId',
      'photo',
      'password',
      'admissionDate',
      'status',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'admissionDate') {
          updateData[field] = new Date(body[field]);
        } else if (field === 'email' || field === 'courseId' || field === 'branchId' || field === 'photo') {
          updateData[field] = body[field] || null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const student = await db.student.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, courseName: true } },
        branch: { select: { id: true, branchName: true } },
      },
    });

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingStudent = await db.student.findUnique({ where: { id } });
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    await db.student.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
