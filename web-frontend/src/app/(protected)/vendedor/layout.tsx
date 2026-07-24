'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';

export default function VendedorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [user, isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) {
    return null; // Return null while redirecting
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface/50 backdrop-blur-xl">
        <WorkspaceSwitcher currentWorkspace="vendedor" />
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/vendedor/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/10 text-brand transition-colors"
          >
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link 
            href="/vendedor/anunciar"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <span className="font-medium text-sm">Novo Anúncio</span>
          </Link>
          <Link 
            href="/vendedor/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <span className="font-medium text-sm">Mensagens</span>
          </Link>
          <Link 
            href="/vendedor/notificacoes"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <span className="font-medium text-sm">Notificações</span>
          </Link>
          <Link 
            href="/vendedor/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <span className="font-medium text-sm">Desempenho</span>
          </Link>
          <Link 
            href="/vendedor/perfil"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <span className="font-medium text-sm">Meu Perfil</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>

      {/* Bottom Tab Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface/80 backdrop-blur-xl flex justify-around items-center px-4 z-50">
        <Link 
          href="/comprador/dashboard"
          className="p-2 flex flex-col items-center gap-1 text-muted"
        >
          <div className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-md">C</div>
          <span className="text-[10px] font-medium">Compras</span>
        </Link>
        <Link href="/vendedor/dashboard" className="p-2 text-brand flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium">Loja</span>
        </Link>
        <Link href="/vendedor/anunciar" className="p-2 text-muted flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium">Vender</span>
        </Link>
        <Link href="/vendedor/chat" className="p-2 text-muted flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium">Chat</span>
        </Link>
        <Link href="/vendedor/perfil" className="p-2 text-muted flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
