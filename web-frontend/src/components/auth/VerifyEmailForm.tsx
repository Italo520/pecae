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
    <div className="bg-surface p-8 rounded-3xl border border-border max-w-md w-full mx-auto relative overflow-hidden backdrop-blur-md">
      <button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-muted hover:text-foreground transition-colors cursor-pointer"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      <div className="text-center mb-8 mt-4">
        <div className="w-12 h-12 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-6 h-6 text-brand" />
        </div>
        <h1 className="text-2xl font-bold font-display text-foreground">Verificação</h1>
        <p className="text-sm text-muted mt-2">
          Insira o código de 6 dígitos enviado ao seu e-mail para ativar sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-center" htmlFor="code">
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
              className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-center tracking-[0.7em] font-mono text-2xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground ${
                errors.code ? 'border-error focus:ring-error focus:border-error' : 'border-border'
              }`}
            />
          </div>
          {errors.code && <p className="text-error text-xs mt-2 text-center">{errors.code.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 focus:ring-4 focus:ring-brand/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
        >
          {isSubmitting ? 'Verificando...' : 'Sincronizar Agora'}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted">
            Problemas no recebimento?{' '}
            <button
              type="button"
              onClick={resendCode}
              className="text-brand hover:underline cursor-pointer font-medium"
            >
              REENVIAR
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
