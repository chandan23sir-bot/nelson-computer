import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: { studentId?: string } = {};
    if (studentId) {
      where.studentId = studentId;
    }

    const results = await db.result.findMany({
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
        exam: {
          select: {
            id: true,
            examName: true,
            examDate: true,
            totalMarks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, examId, marks, grade } = body as {
      studentId: string;
      examId?: string;
      marks: string;
      grade: string;
    };

    if (!studentId || !marks || !grade) {
      return NextResponse.json(
        { success: false, message: 'studentId, marks, and grade are required' },
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

    const result = await db.result.create({
      data: {
        studentId,
        examId: examId || null,
        marks,
        grade,
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
        exam: {
          select: {
            id: true,
            examName: true,
            examDate: true,
            totalMarks: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Create result error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
