import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    let data: any = {};
    try {
      data = await res.json();
    } catch (e) {
      data = { message: res.statusText || 'Erro na comunicação com o backend' };
    }
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const userRole = data.user?.type || data.user?.role || 'COMPRADOR';
    const accessToken = data.tokens?.accessToken;
    const refreshToken = data.tokens?.refreshToken;

    const response = NextResponse.json({ 
      user: data.user, 
      accessToken 
    });

    if (refreshToken) {
      response.cookies.set({
        name: 'refresh_token',
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 604800, // 7 days
      });
    }
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
