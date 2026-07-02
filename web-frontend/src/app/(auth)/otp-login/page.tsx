import { OtpLoginForm } from '@/components/auth/OtpLoginForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Login por Telefone — PECAÊ',
  description: 'Acesse sua conta usando um código recebido via telefone.',
};

export default function OtpLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-white rounded-2xl shadow-sm border border-gray-100"></div>}>
        <OtpLoginForm />
      </Suspense>
    </div>
  );
}
