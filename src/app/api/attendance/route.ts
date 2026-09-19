import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');

    const where: { studentId?: string; date?: { gte: Date; lte: Date } } = {};
    if (studentId) {
      where.studentId = studentId;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendance = await db.attendance.findMany({
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
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, date, status } = body as {
      studentId: string;
      date: string;
      status?: string;
    };

    if (!studentId || !date) {
      return NextResponse.json(
        { success: false, message: 'studentId and date are required' },
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

    const attendance = await db.attendance.create({
      data: {
        studentId,
        date: new Date(date),
        status: status || 'present',
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

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
