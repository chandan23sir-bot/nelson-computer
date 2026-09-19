import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('nelson_session');

    if (!session || !session.value) {
      return NextResponse.json({ success: false });
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(session.value, 'base64').toString()
      );

      return NextResponse.json({
        success: true,
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          loginType: decoded.loginType,
        },
      });
    } catch {
      return NextResponse.json({ success: false });
    }
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
