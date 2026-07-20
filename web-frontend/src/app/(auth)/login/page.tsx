import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Entrar — PECAÊ',
  description: 'Acesse sua conta para gerenciar anúncios ou buscar peças.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white rounded-2xl shadow-sm border border-gray-100"></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
