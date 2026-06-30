import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Entrar — PECAÊ',
  description: 'Acesse sua conta para gerenciar anúncios ou buscar peças.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
