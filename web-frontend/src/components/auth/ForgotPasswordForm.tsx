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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto relative overflow-hidden">
      <Link 
        href="/login" 
        className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        aria-label="Voltar para o login"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
        <p className="text-sm text-gray-500 mt-2">
          Insira seu e-mail para receber um link de redefinição de chave.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            E-mail de Cadastro
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="tecnico@pecae.com.br"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Solicitando...' : 'Solicitar Reset'}
        </button>
      </form>
    </div>
  );
}
