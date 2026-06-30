'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { LayoutDashboard, Heart, Search, MessageCircle, User } from 'lucide-react';

export default function CompradorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return null; // Return null while redirecting
  }

  const navItems = [
    { name: 'Dashboard', href: '/comprador/dashboard', icon: LayoutDashboard },
    { name: 'Favoritos', href: '/comprador/favoritos', icon: Heart },
    { name: 'Buscas Salvas', href: '/comprador/buscas-salvas', icon: Search },
    { name: 'Negociações', href: '/comprador/negociacoes', icon: MessageCircle },
    { name: 'Meu Perfil', href: '/comprador/perfil', icon: User },
  ];

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-[var(--color-surface)] relative z-0">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-xl font-display font-semibold tracking-wider text-[var(--color-primary)]">
              PECAÊ <span className="text-white/50 text-sm">COMPRADOR</span>
            </h2>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>

      {/* Bottom Tab Mobile (Simulated for small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 bg-black/80 backdrop-blur-xl flex justify-around items-center px-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`p-2 flex flex-col items-center gap-1 ${
                isActive ? 'text-[var(--color-primary)]' : 'text-white/70'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
