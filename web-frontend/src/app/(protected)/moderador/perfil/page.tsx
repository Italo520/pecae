'use client';

import { User, Lock, Mail, Bell, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function PerfilModeradorPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] flex items-center justify-center flex-shrink-0 border border-[var(--brand)]/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-1">
              Perfil Administrativo
            </h1>
            <p className="text-[var(--muted)]">
              Credenciais de acesso e logs de segurança da moderação.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          
          {/* Informações Pessoais */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Dados da Conta</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Nome de Exibição</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input 
                    type="email" 
                    defaultValue={user?.email || ''}
                    disabled
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--muted)] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2.5 rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold hover:opacity-90 transition-colors">
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Segurança e Acesso</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Senha Atual</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full md:w-1/2 bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full md:w-1/2 bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]/50"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-hover)] transition-colors">
                Atualizar Senha
              </button>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-[var(--brand)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Notificações Administrativas</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
                <div>
                  <h4 className="text-sm font-medium text-[var(--foreground)]">Alertas de Fraude</h4>
                  <p className="text-xs text-[var(--muted)]">Receber e-mails sobre denúncias com gravidade ALTA.</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[var(--brand)] focus:ring-[var(--brand)]/50" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
                <div>
                  <h4 className="text-sm font-medium text-[var(--foreground)]">Relatórios Semanais</h4>
                  <p className="text-xs text-[var(--muted)]">Resumo de documentos aprovados e métricas.</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-[var(--border)] bg-[var(--background)] text-[var(--brand)] focus:ring-[var(--brand)]/50" defaultChecked />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-red-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-red-500 font-semibold mb-1">Encerrar Sessão</h3>
              <p className="text-xs text-[var(--muted)]">Desconectar do painel administrativo de forma segura.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
