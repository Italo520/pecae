'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';

// Temporarily declaring schema here in case it's not exported properly from @pecae/shared yet
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const res = await authService.login(data);
      
      let next = searchParams.get('next');
      if (!next || next === '/') {
        if ((res.user.type as string) === 'SELLER' || (res.user.type as string) === 'VENDEDOR') {
          next = '/vendedor/dashboard';
        } else if ((res.user.type as string) === 'MODERATOR' || (res.user.type as string) === 'ADMIN') {
          next = '/moderador/dashboard';
        } else {
          next = '/comprador/dashboard';
        }
      }
      
      router.push(next);
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border max-w-md w-full mx-auto backdrop-blur-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-foreground">Bem-vindo de volta</h1>
        <p className="text-sm text-muted mt-2">Acesse sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
              errors.email ? 'border-error' : 'border-border'
            }`}
          />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
              errors.password ? 'border-error' : 'border-border'
            }`}
          />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
          
          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error/10 text-error text-sm rounded-xl border border-error/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 focus:ring-4 focus:ring-brand/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{' '}
        <Link href="/register" className="text-brand hover:underline font-bold">
          Cadastre-se
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-border text-foreground font-medium py-3 rounded-xl hover:bg-background/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>
  );
}
