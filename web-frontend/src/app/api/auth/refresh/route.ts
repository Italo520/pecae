import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Read the HttpOnly cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3333/api/v1';

    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // If refresh fails, it means session expired or token revoked.
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json({ 
      accessToken: data.tokens.accessToken 
    });
    
    // Refresh the HttpOnly token
    if (data.tokens.refreshToken) {
      response.cookies.set({
        name: 'refresh_token',
        value: data.tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 604800,
      });
      
      // If the backend returns user role on refresh, update it too, though it's optional
      if (data.user?.type || data.user?.role) {
        const userRole = data.user?.type || data.user?.role;
        response.cookies.set({
          name: 'user_role',
          value: userRole,
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 604800,
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Refresh proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
