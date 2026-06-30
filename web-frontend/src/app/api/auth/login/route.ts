import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = process.env.API_URL || 'http://localhost:3333/api/v1';

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // data format expected from backend: { user: { ..., type: "VENDEDOR" }, tokens: { accessToken, refreshToken } }
    // Fallback if role is named differently:
    const userRole = data.user?.type || data.user?.role || 'COMPRADOR';

    const response = NextResponse.json({ 
      user: data.user, 
      accessToken: data.tokens.accessToken 
    });
    
    // Set HttpOnly refresh token
    response.cookies.set({
      name: 'refresh_token',
      value: data.tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth', // Sent only to auth endpoints for refreshing
      maxAge: 604800, // 7 days
    });

    // Set user_role cookie for middleware routing
    response.cookies.set({
      name: 'user_role',
      value: userRole,
      httpOnly: false, // Accessible by middleware and client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    });

    return response;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
