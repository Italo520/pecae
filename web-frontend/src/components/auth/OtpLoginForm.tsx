'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { Phone, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Telefone inválido'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'O código deve ter exatamente 6 dígitos'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

export function OtpLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const phoneForm = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema) });
  const codeForm = useForm<CodeFormData>({ resolver: zodResolver(codeSchema) });

  const onSendOtp = async (data: PhoneFormData) => {
    try {
      await authService.sendOtp({ phone: data.phone });
      setPhoneNumber(data.phone);
      setStep('code');
      toast.success('Código enviado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao enviar código. Verifique o número digitado.');
    }
  };

  const onVerifyOtp = async (data: CodeFormData) => {
    try {
      await authService.otpLogin({ phone: phoneNumber, code: data.code });
      toast.success('Login efetuado com sucesso!');
      
      const next = searchParams.get('next') || '/';
      router.push(next);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Código inválido ou expirado.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto relative overflow-hidden">
      <button 
        onClick={() => step === 'code' ? setStep('phone') : router.push('/login')}
        className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 'phone' ? 'Acesso via Telefone' : 'Verificação de Segurança'}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {step === 'phone' 
            ? 'Insira seu número para receber um código de acesso via SMS/WhatsApp.'
            : `Enviamos um código de 6 dígitos para ${phoneNumber}`}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Telefone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+55 11 99999-9999"
                {...phoneForm.register('phone')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                  phoneForm.formState.errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {phoneForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={phoneForm.formState.isSubmitting}
            className="w-full bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {phoneForm.formState.isSubmitting ? 'Solicitando...' : 'Solicitar Código'}
          </button>
        </form>
      ) : (
        <form onSubmit={codeForm.handleSubmit(onVerifyOtp)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="code">
              Código de 6 dígitos
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                {...codeForm.register('code')}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-center tracking-[0.5em] font-mono text-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
                  codeForm.formState.errors.code ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {codeForm.formState.errors.code && <p className="text-red-500 text-xs mt-1 text-center tracking-normal font-sans">{codeForm.formState.errors.code.message}</p>}
          </div>

          <button
            type="submit"
            disabled={codeForm.formState.isSubmitting}
            className="w-full bg-[var(--color-primary)] text-black font-semibold py-2.5 rounded-lg hover:brightness-95 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {codeForm.formState.isSubmitting ? 'Verificando...' : 'Verificar e Entrar'}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={phoneForm.handleSubmit(onSendOtp)}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Reenviar código
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
