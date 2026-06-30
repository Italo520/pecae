import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3333/api/v1';

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const userRole = data.user?.type || data.user?.role || 'COMPRADOR';

    console.log('Proxy Login: Token recebido do backend:', data.tokens.refreshToken ? 'Sim (presente)' : 'Não');

    const response = NextResponse.json({ 
      user: data.user, 
      accessToken: data.tokens.accessToken 
    });

    // Set HttpOnly refresh token directly on response
    response.cookies.set({
      name: 'refresh_token',
      value: data.tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 604800, // 7 days
    });
    console.log('Proxy Login: Cookie refresh_token setado diretamente no NextResponse');

    // Set user_role cookie for middleware routing
    response.cookies.set({
      name: 'user_role',
      value: userRole,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    });
    console.log('Proxy Login: Cookie user_role setado diretamente no NextResponse');

    return response;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
