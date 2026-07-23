'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ChevronDown, ShoppingBag, Store } from 'lucide-react';

interface WorkspaceSwitcherProps {
  currentWorkspace: 'comprador' | 'vendedor';
}

export function WorkspaceSwitcher({ currentWorkspace }: WorkspaceSwitcherProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userType = (user?.type as string) || ((user as any)?.role as string);
  const isSeller = userType === 'SELLER' || userType === 'VENDEDOR' || userType === 'BOTH' || userType === 'AMBOS';

  // Fechar o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Se o usuário não é vendedor/ambos, apenas exibe o título estático para Comprador
  if (!isSeller) {
    return (
      <div className="p-6 pb-2">
        <Link href="/">
          <h2 className="text-xl font-display font-bold tracking-wider text-[var(--brand)]">
            PECAÊ <span className="text-[var(--muted)] font-sans text-sm">COMPRADOR</span>
          </h2>
        </Link>
      </div>
    );
  }

  const workspaces = [
    {
      id: 'comprador',
      name: 'PECAÊ Comprador',
      icon: ShoppingBag,
      href: '/comprador/dashboard',
      description: 'Suas compras e buscas'
    },
    {
      id: 'vendedor',
      name: 'PECAÊ PRO',
      icon: Store,
      href: '/vendedor/dashboard',
      description: 'Gestão da sua loja'
    }
  ];

  const activeWorkspace = workspaces.find(w => w.id === currentWorkspace) || workspaces[0];

  return (
    <div className="p-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors border border-transparent hover:border-[var(--border)]"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentWorkspace === 'vendedor' ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : 'bg-blue-500/10 text-blue-500'}`}>
            <activeWorkspace.icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-[var(--foreground)] leading-tight">
              {activeWorkspace.name}
            </h2>
            <span className="text-[10px] text-[var(--muted)]">{activeWorkspace.description}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-20 left-4 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === currentWorkspace;
              return (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (!isActive) router.push(workspace.href);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                    isActive 
                      ? 'bg-[var(--foreground)]/5 cursor-default' 
                      : 'hover:bg-[var(--foreground)]/5 cursor-pointer'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${workspace.id === 'vendedor' ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : 'bg-blue-500/10 text-blue-500'}`}>
                    <workspace.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{workspace.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
