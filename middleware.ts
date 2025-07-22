import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページとAPIルートは認証をスキップ
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // セッショントークンを取得
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    // セッションがない場合はログインページにリダイレクト
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // セッショントークンを検証
    const sessionData = await verifySessionToken(sessionToken);

    if (!sessionData || !sessionData.authenticated) {
      // セッションが無効な場合はログインページにリダイレクト
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }

    // セッションが有効な場合は続行
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware auth error:', error);
    // エラーが発生した場合はログインページにリダイレクト
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};