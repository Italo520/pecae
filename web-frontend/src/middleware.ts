import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/perfil', '/meus-anuncios', '/favoritos', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // 1. Check if the user is authenticated (has refresh_token)
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Role-Based Access Control (RBAC) via user_role cookie
    const userRole = request.cookies.get('user_role')?.value;

    // RBAC: Seller only routes
    if (pathname.startsWith('/meus-anuncios')) {
      if (userRole !== 'VENDEDOR' && userRole !== 'AMBOS' && userRole !== 'ADMIN') {
        // Redirecionar para perfil (acesso negado)
        return NextResponse.redirect(new URL('/perfil', request.url));
      }
    }

    // RBAC: Admin only routes
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN' && userRole !== 'MODERADOR') {
        return NextResponse.redirect(new URL('/perfil', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/perfil/:path*', 
    '/meus-anuncios/:path*', 
    '/favoritos/:path*',
    '/admin/:path*'
  ],
};
