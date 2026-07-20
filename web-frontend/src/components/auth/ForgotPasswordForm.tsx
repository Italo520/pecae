'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data);
      toast.success('Se o e-mail estiver cadastrado, você receberá um link de recuperação.', {
        duration: 5000,
      });
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao processar solicitação. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border max-w-md w-full mx-auto relative overflow-hidden backdrop-blur-md">
      <Link 
        href="/login" 
        className="absolute top-6 left-6 text-muted hover:text-foreground transition-colors cursor-pointer"
        aria-label="Voltar para o login"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold font-display text-foreground">Recuperar Senha</h1>
        <p className="text-sm text-muted mt-2">
          Insira seu e-mail para receber um link de redefinição de chave.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
            E-mail de Cadastro
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="tecnico@pecae.com.br"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                errors.email ? 'border-error focus:ring-error focus:border-error' : 'border-border'
              }`}
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 focus:ring-4 focus:ring-brand/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Solicitando...' : 'Solicitar Reset'}
        </button>
      </form>
    </div>
  );
}
