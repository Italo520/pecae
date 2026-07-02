'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Heart, Bell, Menu, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && isAuthenticated;

  const getFavoritesUrl = () => {
    if (!isLoggedIn) return '/login';
    return user?.role === 'SELLER' ? '/vendedor/dashboard' : '/comprador/favoritos';
  };

  const getNotificationsUrl = () => {
    if (!isLoggedIn) return '/login';
    // Placeholder, redirects to dashboard for now since notificacoes page is not created
    return user?.role === 'SELLER' ? '/vendedor/dashboard' : '/comprador/dashboard';
  };

  const handleLocationClick = () => {
    alert('Funcionalidade de localização em desenvolvimento');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--surface)] backdrop-blur-[var(--blur)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop & Mobile Top Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button className="md:hidden text-[var(--foreground)] p-1">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2" aria-label="Home PECAÊ">
              {/* Simplistic Logo representation */}
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--brand)] flex items-center justify-center text-white font-bold text-xl leading-none">
                P
              </div>
              <span className="hidden md:block text-xl font-bold tracking-tight text-[var(--foreground)]">
                PECAÊ
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-2xl px-4">
            <SearchBar placeholder="Buscar peças, veículos, lojas..." />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            
            {/* Location (Client island placeholder) */}
            <button 
              onClick={handleLocationClick}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>São Paulo - SP</span>
            </button>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <Link href={getFavoritesUrl()} className="relative text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                <Heart className="w-6 h-6" />
                {isLoggedIn && (
                  <Badge variant="count" label={3} className="absolute -top-1.5 -right-1.5" />
                )}
              </Link>
              <Link href={getNotificationsUrl()} className="relative text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                <Bell className="w-6 h-6" />
                {isLoggedIn && (
                  <Badge variant="count" label={1} className="absolute -top-1.5 -right-1.5" />
                )}
              </Link>
            </div>

            {/* Auth / Avatar */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <Link 
                  href={user?.role === 'SELLER' ? '/vendedor/dashboard' : '/comprador/dashboard'} 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="Acessar Dashboard"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[var(--muted)]" />
                    )}
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--brand)] transition-colors">
                  Entrar
                </Link>
              )}
            </div>

            {/* CTA Announce */}
            <Button variant="primary" size="sm" className="hidden sm:flex">
              <Link href="/anunciar">Anunciar</Link>
            </Button>
            
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <SearchBar placeholder="Buscar no PECAÊ..." />
        </div>
        
      </div>
    </header>
  );
}
