'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos de uso' }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar a política de privacidade' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Validate only step 1 fields
    const isStepValid = await trigger(['name', 'email']);
    if (isStepValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError(null);
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        type: 'BUYER',
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted
      });
      toast.success('Conta criada com sucesso!');
      window.location.href = '/';
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.info('Este e-mail já possui cadastro. Redirecionando para o login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      setApiError(err.response?.data?.message || 'Ocorreu um erro ao criar a conta.');
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-border max-w-md w-full mx-auto backdrop-blur-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-foreground text-center">Criar Conta</h1>
        
        {/* Goal Gradient / Progress */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-brand' : 'bg-border'}`} />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-brand' : 'bg-border'}`} />
        </div>
        <p className="text-center text-xs text-muted mt-2 font-medium">
          Passo {step} de 2
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* STEP 1: Name and Email */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                {...register('name')}
                className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                  errors.email ? 'border-error' : 'border-border'
                }`}
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>
            
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-brand text-brand-foreground font-bold py-3 rounded-xl hover:opacity-90 focus:ring-4 focus:ring-brand/30 transition-all mt-4"
            >
              Continuar
            </button>
          </div>
        </div>

        {/* STEP 2: Password */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
              <input
                type="password"
                placeholder="Mínimo de 8 caracteres"
                {...register('password')}
                className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                  errors.password ? 'border-error' : 'border-border'
                }`}
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirmar Senha</label>
              <input
                type="password"
                placeholder="Repita a senha"
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none transition-colors text-foreground placeholder:text-muted ${
                  errors.confirmPassword ? 'border-error' : 'border-border'
                }`}
              />
              {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand accent-[var(--brand)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  Li e concordo com os{' '}
                  <Link href="/termos-de-uso" target="_blank" className="text-[var(--brand)] hover:underline font-medium">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              {errors.termsAccepted && <p className="text-error text-xs">{errors.termsAccepted.message}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('privacyAccepted')}
                  className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand accent-[var(--brand)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  Li e concordo com a{' '}
                  <Link href="/politica-de-privacidade" target="_blank" className="text-[var(--brand)] hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.privacyAccepted && <p className="text-error text-xs">{errors.privacyAccepted.message}</p>}
            </div>

            {apiError && (
              <div className="p-3 bg-error/10 text-error text-sm rounded-xl border border-error/20">
                {apiError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-transparent border border-border text-foreground font-medium py-3 rounded-xl hover:bg-background/50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-brand text-brand-foreground font-bold py-3 rounded-xl hover:opacity-90 focus:ring-4 focus:ring-brand/30 transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link href="/login" className="text-brand hover:underline font-bold">
          Entrar
        </Link>
      </div>
    </div>
  );
}
