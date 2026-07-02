'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { MailCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/auth.service';

const verifySchema = z.object({
  code: z.string().length(6, 'O código deve ter 6 dígitos'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export function VerifyEmailForm() {
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormData) => {
    try {
      await authService.verifyEmail(data);
      toast.success('E-mail verificado com sucesso!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Código inválido ou expirado.');
    }
  };

  const resendCode = async () => {
    try {
      await apiClient.post('/auth/resend-verification');
      toast.info('Novo código de acesso enviado.');
    } catch (err: any) {
      toast.error('Não foi possível reenviar o código.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto relative overflow-hidden">
      <button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      <div className="text-center mb-8 mt-4">
        <div className="w-12 h-12 bg-blue-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verificação</h1>
        <p className="text-sm text-gray-500 mt-2">
          Insira o código de 6 dígitos enviado ao seu e-mail para ativar sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-center" htmlFor="code">
            CÓDIGO DE SINCRONIZAÇÃO
          </label>
          <div className="relative">
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              {...register('code')}
              className={`w-full px-4 py-3 border rounded-lg text-center tracking-[0.7em] font-mono text-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                errors.code ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.code && <p className="text-red-500 text-xs mt-2 text-center">{errors.code.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
        >
          {isSubmitting ? 'Verificando...' : 'Sincronizar Agora'}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Problemas no recebimento?{' '}
            <button
              type="button"
              onClick={resendCode}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              REENVIAR
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
