import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

    const res = await fetch(`${apiUrl}/auth/phone/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const userRole = data.user?.type || data.user?.role || 'COMPRADOR';

    console.log('Proxy OTP Login: Token recebido do backend:', data.tokens?.refreshToken ? 'Sim (presente)' : 'Não');

    const response = NextResponse.json({ 
      user: data.user, 
      accessToken: data.tokens.accessToken 
    });

    // Set HttpOnly refresh token directly on response
    if (data.tokens?.refreshToken) {
      response.cookies.set({
        name: 'refresh_token',
        value: data.tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 604800, // 7 days
      });
    }

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

    return response;
  } catch (error) {
    console.error('OTP Login proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
