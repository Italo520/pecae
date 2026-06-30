import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Criar Conta — PECAÊ',
  description: 'Cadastre-se na PECAÊ para comprar e vender peças automotivas.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
