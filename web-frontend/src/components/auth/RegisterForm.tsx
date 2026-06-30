'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
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
      // Fora do escopo mobile M02/M03, mas aqui assumiremos um registro simples
      // O tipo de conta (Comprador/Vendedor) poderia ser um terceiro step. Por ora: COMPRADOR.
      await authService.register({ ...data, type: 'COMPRADOR', termsAccepted: true });
      router.push('/');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Ocorreu um erro ao criar a conta.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Criar Conta</h1>
        
        {/* Goal Gradient / Progress */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
        <p className="text-center text-xs text-gray-500 mt-2 font-medium">
          Passo {step} de 2
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* STEP 1: Name and Email */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                {...register('name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all mt-4"
            >
              Continuar
            </button>
          </div>
        </div>

        {/* STEP 2: Password */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                placeholder="Mínimo de 6 caracteres"
                {...register('password')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <input
                type="password"
                placeholder="Repita a senha"
                {...register('confirmPassword')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {apiError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70"
              >
                {isSubmitting ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Entrar
        </Link>
      </div>
    </div>
  );
}
