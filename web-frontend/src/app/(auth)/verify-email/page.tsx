import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Verificar E-mail — PECAÊ',
  description: 'Verifique seu e-mail para ativar sua conta.',
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white rounded-2xl shadow-sm border border-gray-100"></div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
