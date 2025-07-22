import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();


    if (!password) {
      return NextResponse.json(
        { success: false, message: 'パスワードが必要です' },
        { status: 400 }
      );
    }

    // パスワードを検証
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }

    // セッショントークンを生成
    const sessionToken = await createSessionToken();

    // Cookieにセッショントークンを設定
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60, // 1時間
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'ログインしました'
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}