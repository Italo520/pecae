'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { LayoutDashboard, Megaphone, FileText, AlertTriangle, User } from 'lucide-react';

export default function ModeradorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('ModeradorLayout Mount/Update:', { isInitialized, isAuthenticated, userType: user?.type, userRole: (user as any)?.role });

    if (!isInitialized) return;

    if (!isAuthenticated) {
      console.log('ModeradorLayout Redirecting to /login because !isAuthenticated');
      router.replace('/login');
    } else if (user?.type !== 'MODERATOR' && user?.type !== 'ADMIN') {
      console.log('ModeradorLayout Redirecting to /acesso-negado because type is not MODERATOR/ADMIN');
      router.replace('/acesso-negado');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || (user?.type !== 'MODERATOR' && user?.type !== 'ADMIN')) {
    return null;
  }

  const navItems: { name: string, href: string, icon: any, disabled?: boolean }[] = [
    { name: 'Analytics', href: '/moderador/dashboard', icon: LayoutDashboard },
    { name: 'Documentos', href: '/moderador/documentos', icon: FileText },
    { name: 'Anúncios', href: '/moderador/anuncios', icon: Megaphone },
    { name: 'Campanhas', href: '/moderador/campanhas', icon: Megaphone },
    { name: 'Denúncias', href: '/moderador/reports', icon: AlertTriangle },
    { name: 'Meu Perfil', href: '/moderador/perfil', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-xl font-display font-semibold tracking-wider text-[var(--brand)]">
              PECAÊ <span className="text-[var(--muted)] text-sm">MODERADOR</span>
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
                href={item.disabled ? '#' : item.href}
                onClick={(e) => {
                  if (item.disabled) { e.preventDefault(); alert('Em breve!'); }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed text-[var(--muted)]' :
                    isActive
                      ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-semibold'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.disabled && <span className="text-[10px] bg-[var(--surface-hover)] px-2 py-0.5 rounded text-[var(--muted)]">Em breve</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>

      {/* Bottom Tab Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl flex justify-around items-center px-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              onClick={(e) => {
                if (item.disabled) { e.preventDefault(); alert('Em breve!'); }
              }}
              className={`p-2 flex flex-col items-center gap-1 ${item.disabled ? 'opacity-50 cursor-not-allowed' :
                  isActive ? 'text-[var(--brand)]' : 'text-[var(--muted)]'
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
