'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function VendedorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'BUYER') {
      router.replace('/acesso-negado');
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || user?.role === 'BUYER') {
    return null; // Return null while redirecting
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="p-6">
          <h2 className="text-xl font-display font-semibold tracking-wider text-[var(--color-primary)]">
            PECAÊ <span className="text-white/50 text-sm">PRO</span>
          </h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/vendedor/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors"
          >
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link 
            href="/vendedor/anunciar"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="font-medium text-sm">Novo Anúncio</span>
          </Link>
          <Link 
            href="/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="font-medium text-sm">Mensagens</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom Tab Mobile (Simulated for small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-black/80 backdrop-blur-xl flex justify-around items-center px-4 z-50">
        <Link href="/vendedor/dashboard" className="p-2 text-[var(--color-primary)]">
          <span className="text-xs font-medium">Início</span>
        </Link>
        <Link href="/vendedor/anunciar" className="p-2 text-white/70">
          <span className="text-xs font-medium">Vender</span>
        </Link>
        <Link href="/chat" className="p-2 text-white/70">
          <span className="text-xs font-medium">Chat</span>
        </Link>
      </nav>
    </div>
  );
}
