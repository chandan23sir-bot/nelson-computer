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

    const fees = await db.fee.findMany({
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

    return NextResponse.json({ success: true, data: fees });
  } catch (error) {
    console.error('Get fees error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, amount, paymentDate, status, receiptNo, month } = body as {
      studentId: string;
      amount: number;
      paymentDate?: string;
      status?: string;
      receiptNo?: string;
      month?: string;
    };

    if (!studentId || amount === undefined) {
      return NextResponse.json(
        { success: false, message: 'studentId and amount are required' },
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

    const fee = await db.fee.create({
      data: {
        studentId,
        amount: Number(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        status: status || 'pending',
        receiptNo: receiptNo || null,
        month: month || null,
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

    return NextResponse.json({ success: true, data: fee }, { status: 201 });
  } catch (error) {
    console.error('Create fee error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
