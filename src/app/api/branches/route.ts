import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const branches = await db.branch.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = branches.map((b) => ({
      id: b.id,
      branchName: b.branchName,
      ownerName: b.ownerName,
      email: b.email,
      address: b.address,
      mobile: b.mobile,
      status: b.status,
      studentCount: b._count.students,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchName, ownerName, email, password, address, mobile, status } = body as {
      branchName: string;
      ownerName: string;
      email: string;
      password: string;
      address?: string;
      mobile?: string;
      status?: string;
    };

    if (!branchName || !ownerName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'branchName, ownerName, email, and password are required' },
        { status: 400 }
      );
    }

    const branch = await db.branch.create({
      data: {
        branchName,
        ownerName,
        email,
        password,
        address: address || null,
        mobile: mobile || null,
        status: status || 'active',
      },
    });

    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
