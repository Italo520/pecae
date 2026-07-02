'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirme sua senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token de redefinição ausente. Solicite um novo link.');
      return;
    }

    try {
      await authService.resetPassword({ token, password: data.newPassword });
      setIsSuccess(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao redefinir senha. O link pode estar expirado.';
      toast.error(message);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-surface p-8 rounded-3xl border border-border max-w-md w-full mx-auto text-center backdrop-blur-md">
        <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-display text-foreground mb-2">Chave Redefinida!</h1>
        <p className="text-muted mb-8">
          Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova chave de acesso.
        </p>
        <Link 
          href="/login"
          className="inline-flex w-full justify-center bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 focus:ring-4 focus:ring-brand/30 transition-all duration-200"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold font-display text-foreground">Nova Senha</h1>
        <p className="text-sm text-muted mt-2">
          Crie uma nova chave de acesso segura.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="newPassword">
            Nova Chave
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted" />
            </div>
            <input
              id="newPassword"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              {...register('newPassword')}
              className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                errors.newPassword ? 'border-error focus:ring-error focus:border-error' : 'border-border'
              }`}
            />
          </div>
          {errors.newPassword && <p className="text-error text-xs mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="confirmPassword">
            Confirmar Chave
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita a nova chave"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                errors.confirmPassword ? 'border-error focus:ring-error focus:border-error' : 'border-border'
              }`}
            />
          </div>
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 focus:ring-4 focus:ring-brand/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Redefinindo...' : 'Redefinir Chave'}
        </button>
      </form>
    </div>
  );
}
