'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fallback in case Zustand hydratation takes a moment
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {user?.type || 'Perfil Padrão'}
            </span>
          </div>
        </div>

        {/* Actions Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Minha Conta</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Dados Pessoais</p>
                <p className="text-sm text-gray-500">Atualize seu nome, telefone e endereço.</p>
              </div>
              <span className="text-blue-600 text-sm font-medium">Editar</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Segurança</p>
                <p className="text-sm text-gray-500">Altere sua senha e dispositivos conectados.</p>
              </div>
              <span className="text-blue-600 text-sm font-medium">Gerenciar</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 font-medium hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
