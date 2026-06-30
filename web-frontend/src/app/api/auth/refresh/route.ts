import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Read the HttpOnly cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;
    console.log(`Proxy Refresh: Token vindo do Cookie: ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'Nulo'}`);
    
    if (!refreshToken) {
      console.log('Proxy Refresh: Nenhum refresh token fornecido nos cookies.');
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
      console.log(`Proxy Refresh: Backend retornou erro ${res.status}:`, data.message || data);
      return NextResponse.json(data, { status: res.status });
    }

    console.log(`Proxy Refresh: Sucesso! Novo AccessToken gerado. Novo RefreshToken retornado: ${data.tokens?.refreshToken ? data.tokens.refreshToken.substring(0, 10) + '...' : 'Não'}`);

    const response = NextResponse.json({ 
      accessToken: data.tokens.accessToken 
    });

    // Refresh the HttpOnly token directly on response
    if (data.tokens.refreshToken) {
      response.cookies.set({
        name: 'refresh_token',
        value: data.tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 604800,
      });
      console.log('Proxy Refresh: Novo cookie refresh_token setado diretamente no NextResponse.');
      
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
