'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export function SellerCTA() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && isAuthenticated;

  const getCtaTarget = () => {
    if (!isLoggedIn) return '/login?next=/vendedor/onboarding';
    
    const userType = (user?.type as string) || ((user as any)?.role as string);
    const isSeller = userType === 'SELLER' || userType === 'VENDEDOR' || userType === 'BOTH' || userType === 'AMBOS';

    if (isSeller) {
      return '/vendedor/anunciar';
    }
    return '/vendedor/onboarding';
  };

  return (
    <section className="w-full bg-[var(--brand)] py-12" aria-label="Área do Vendedor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-[var(--brand-foreground)] mb-2">
            Venda suas peças automotivas
          </h2>
          <p className="text-[var(--brand-foreground)]/90 text-lg max-w-xl">
            🚘 Cadastre seus veículos doadores e alcance compradores de todo o Brasil rapidamente.
          </p>
        </div>
        
        <div className="shrink-0">
          <Link 
            href={getCtaTarget()} 
            className="inline-flex items-center justify-center bg-[var(--brand-foreground)] text-[var(--brand)] font-bold py-3 px-8 rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-lg"
          >
            Anunciar Agora &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
