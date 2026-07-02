import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Recuperar Senha — PECAÊ',
  description: 'Esqueceu sua senha? Solicite a recuperação.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white rounded-2xl shadow-sm border border-gray-100"></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
