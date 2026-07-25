import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/perfil', '/meus-anuncios', '/favoritos', '/admin', '/vendedor', '/moderador', '/comprador'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // 1. Verificar autenticação via cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const pecaeToken = request.cookies.get('pecae_token')?.value;
    
    if (!refreshToken && !pecaeToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. RBAC via cookie user_role
    const userRole = request.cookies.get('user_role')?.value || '';

    // RBAC: Moderadores e Admins são redirecionados para o painel correto
    // Não devem acessar área de comprador ou vendedor
    if (pathname.startsWith('/comprador') || pathname.startsWith('/vendedor')) {
      const isOnboardingPath = pathname.startsWith('/vendedor/onboarding') || pathname.startsWith('/vendedor/solicitar-verificacao');
      if (!isOnboardingPath && (userRole === 'MODERADOR' || userRole === 'MODERATOR' || userRole === 'ADMIN')) {
        return NextResponse.redirect(new URL('/moderador/dashboard', request.url));
      }
    }

    // RBAC: Somente vendedores podem acessar área restrita do vendedor
    if (pathname.startsWith('/vendedor')) {
      const isAllowedForBuyer = pathname.startsWith('/vendedor/onboarding') || pathname.startsWith('/vendedor/solicitar-verificacao');
      if (!isAllowedForBuyer && userRole !== 'VENDEDOR' && userRole !== 'SELLER' && userRole !== 'AMBOS' && userRole !== 'BOTH' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/comprador/dashboard', request.url));
      }
    }

    if (pathname.startsWith('/meus-anuncios')) {
      if (userRole !== 'VENDEDOR' && userRole !== 'SELLER' && userRole !== 'AMBOS' && userRole !== 'BOTH' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/perfil', request.url));
      }
    }

    // RBAC: Somente Admins e Moderadores podem acessar painel de moderação
    if (pathname.startsWith('/admin') || pathname.startsWith('/moderador')) {
      if (userRole !== 'ADMIN' && userRole !== 'MODERADOR' && userRole !== 'MODERATOR') {
        return NextResponse.redirect(new URL('/acesso-negado', request.url));
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
    '/admin/:path*',
    '/vendedor/:path*',
    '/moderador/:path*',
    '/comprador/:path*',
  ],
};
