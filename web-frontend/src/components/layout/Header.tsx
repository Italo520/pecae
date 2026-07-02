import React from 'react';
import Link from 'next/link';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Heart, Bell, Menu, User } from 'lucide-react';

export function Header() {
  // TODO: Add auth state from store when integrating user context
  const isLoggedIn = false;

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
            <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <MapPin className="w-4 h-4" />
              <span>São Paulo - SP</span>
            </button>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <Link href={isLoggedIn ? "/favoritos" : "/login"} className="relative text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                <Heart className="w-6 h-6" />
                {isLoggedIn && (
                  <Badge variant="count" label={3} className="absolute -top-1.5 -right-1.5" />
                )}
              </Link>
              <Link href={isLoggedIn ? "/notificacoes" : "/login"} className="relative text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
                <Bell className="w-6 h-6" />
                {isLoggedIn && (
                  <Badge variant="count" label={1} className="absolute -top-1.5 -right-1.5" />
                )}
              </Link>
            </div>

            {/* Auth / Avatar */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--muted)]" />
                  </div>
                </button>
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
