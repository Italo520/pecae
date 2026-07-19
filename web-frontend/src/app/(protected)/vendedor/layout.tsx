'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function VendedorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if ((user?.type as string) === 'BUYER' || (user?.type as string) === 'COMPRADOR') {
      router.replace('/comprador/dashboard');
    }
  }, [user, isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated || (user?.type as string) === 'BUYER' || (user?.type as string) === 'COMPRADOR') {
    return null; // Return null while redirecting
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface/50 backdrop-blur-xl">
        <div className="p-6">
          <h2 className="text-xl font-display font-bold tracking-wider text-brand">
            PECAÊ <span className="text-muted font-sans text-sm">PRO</span>
          </h2>
        </div>
        
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>

      {/* Bottom Tab Mobile (Simulated for small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface/80 backdrop-blur-xl flex justify-around items-center px-4 z-50">
        <Link href="/vendedor/dashboard" className="p-2 text-brand">
          <span className="text-xs font-medium">Início</span>
        </Link>
        <Link href="/vendedor/anunciar" className="p-2 text-muted">
          <span className="text-xs font-medium">Vender</span>
        </Link>
        <Link href="/vendedor/chat" className="p-2 text-muted">
          <span className="text-xs font-medium">Chat</span>
        </Link>
        <Link href="/vendedor/perfil" className="p-2 text-muted">
          <span className="text-xs font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
