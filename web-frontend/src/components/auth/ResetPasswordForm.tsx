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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chave Redefinida!</h1>
        <p className="text-gray-500 mb-8">
          Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova chave de acesso.
        </p>
        <Link 
          href="/login"
          className="inline-flex w-full justify-center bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
        >
          Ir para Login
        </Link>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Nova Senha</h1>
        <p className="text-sm text-gray-500 mt-2">
          Crie uma nova chave de acesso segura.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
            Nova Chave
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newPassword"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              {...register('newPassword')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                errors.newPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
            Confirmar Chave
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita a nova chave"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Redefinindo...' : 'Redefinir Chave'}
        </button>
      </form>
    </div>
  );
}
