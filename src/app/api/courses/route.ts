import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const courses = await db.course.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = courses.map((c) => ({
      id: c.id,
      courseName: c.courseName,
      duration: c.duration,
      fees: c.fees,
      syllabus: c.syllabus,
      description: c.description,
      icon: c.icon,
      category: c.category,
      studentCount: c._count.students,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseName, duration, fees, syllabus, description, icon, category } = body as {
      courseName: string;
      duration: string;
      fees: number;
      syllabus?: string;
      description?: string;
      icon?: string;
      category?: string;
    };

    if (!courseName || !duration || fees === undefined) {
      return NextResponse.json(
        { success: false, message: 'courseName, duration, and fees are required' },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        courseName,
        duration,
        fees: Number(fees),
        syllabus: syllabus || null,
        description: description || null,
        icon: icon || null,
        category: category || null,
      },
    });

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
