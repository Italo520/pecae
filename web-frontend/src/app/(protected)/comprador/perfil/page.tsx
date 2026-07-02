'use client';

import { User, Lock, Mail, Bell, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useBuyer } from '@/hooks/useBuyer';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { DeleteAccountModal } from '@/components/profile/DeleteAccountModal';

export default function PerfilCompradorPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  const { getBuyerProfile, updateBuyerProfile, updateNotificationPreferences } = useBuyer();
  const { data: profile, isLoading } = getBuyerProfile;

  const [name, setName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleSaveProfile = () => {
    updateBuyerProfile.mutate({ name }, {
      onSuccess: () => toast.success('Perfil atualizado com sucesso!'),
      onError: () => toast.error('Erro ao atualizar perfil.'),
    });
  };

  const handleToggleNotification = (type: 'email' | 'push' | 'inApp', currentVal: boolean) => {
    const prefs = profile?.notificationPreferences || { email: true, push: true, inApp: true };
    updateNotificationPreferences.mutate({ ...prefs, [type]: !currentVal }, {
      onSuccess: () => toast.success('Preferência de notificação salva.'),
      onError: () => toast.error('Erro ao salvar preferência.'),
    });
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-white/50">Carregando perfil...</div>;
  }

  const prefs = profile?.notificationPreferences || { email: true, push: true, inApp: true };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 border border-[var(--color-primary)]/30">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">
              Meu Perfil
            </h1>
            <p className="text-white/60">
              Gerencie suas informações pessoais e preferências da conta.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          
          {/* Informações Pessoais */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold text-white">Informações Pessoais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="email" 
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveProfile} className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-black font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold text-white">Segurança</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Senha Atual</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full md:w-1/2 bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full md:w-1/2 bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button className="px-6 py-2.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors">
                Atualizar Senha
              </button>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold text-white">Preferências</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="text-sm font-medium text-white">Notificações por E-mail</h4>
                  <p className="text-xs text-white/50">Receber alertas de buscas e mensagens.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.email}
                  onChange={() => handleToggleNotification('email', prefs.email)}
                  className="w-5 h-5 rounded border-white/20 bg-black/50 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50" 
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-red-500/20 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Encerrar Sessão</h3>
                <p className="text-xs text-white/50">Sair da sua conta neste dispositivo.</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-500 font-semibold mb-1">Excluir Conta</h3>
                <p className="text-xs text-white/50">Excluir permanentemente sua conta e seus dados.</p>
              </div>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Excluir Conta
              </button>
            </div>
          </div>

        </div>
      </div>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
}
