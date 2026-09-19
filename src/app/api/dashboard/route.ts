import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total active students
    const totalStudents = await db.student.count({
      where: { status: 'active' },
    });

    // Total branches
    const totalBranches = await db.branch.count();

    // Total courses
    const totalCourses = await db.course.count();

    // Total fees collected (sum of paid fees)
    const paidFees = await db.fee.findMany({
      where: { status: 'paid' },
      select: { amount: true },
    });
    const totalFeesCollected = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Pending fees count
    const pendingFees = await db.fee.count({
      where: { status: 'pending' },
    });

    // Monthly admission data for charts (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const students = await db.student.findMany({
      where: {
        admissionDate: {
          gte: sixMonthsAgo,
        },
      },
      select: { admissionDate: true },
    });

    const monthlyData: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const count = students.filter((s) => {
        const d = new Date(s.admissionDate);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      monthlyData.push({ month: monthName, count });
    }

    // Course popularity (count students per course)
    const coursePopularity = await db.course.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
    });
    const courseData = coursePopularity.map((c) => ({
      courseName: c.courseName,
      studentCount: c._count.students,
    }));

    // Recent admissions (last 5 students with course name)
    const recentAdmissions = await db.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: { courseName: true },
        },
      },
    });

    const recentAdmissionsData = recentAdmissions.map((s) => ({
      id: s.id,
      studentName: s.studentName,
      fatherName: s.fatherName,
      mobile: s.mobile,
      courseName: s.course?.courseName ?? 'N/A',
      admissionDate: s.admissionDate,
      status: s.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalBranches,
        totalCourses,
        totalFeesCollected,
        pendingFees,
        monthlyAdmissions: monthlyData,
        coursePopularity: courseData,
        recentAdmissions: recentAdmissionsData,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
