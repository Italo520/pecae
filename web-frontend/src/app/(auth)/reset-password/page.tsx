import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Nova Senha — PECAÊ',
  description: 'Crie uma nova chave de acesso segura.',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white rounded-2xl shadow-sm border border-gray-100"></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
