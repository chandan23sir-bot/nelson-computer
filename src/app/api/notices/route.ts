import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    const where = all === 'true' ? {} : { isActive: true };

    const notices = await db.notice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    console.error('Get notices error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const session = cookieStore.get('nelson_session');

    if (!session || !session.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(session.value, 'base64').toString()
      );
      if (decoded.loginType !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Only admins can create notices' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, isActive } = body as {
      title: string;
      content: string;
      isActive?: boolean;
    };

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: 'title and content are required' },
        { status: 400 }
      );
    }

    const notice = await db.notice.create({
      data: {
        title,
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error) {
    console.error('Create notice error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
