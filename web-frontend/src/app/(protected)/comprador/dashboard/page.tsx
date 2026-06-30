'use client';

import { ArrowRight, Search, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export default function CompradorDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Olá, {user?.name?.split(' ')[0] || 'Comprador'}
          </h1>
          <p className="text-white/60">
            Bem-vindo ao seu painel. O que você está buscando hoje?
          </p>
        </div>

        {/* Quick Stats / Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/comprador/favoritos" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Favoritos</h3>
            <p className="text-sm text-white/50 mb-4">Veja as sucatas e peças que você salvou.</p>
            <div className="flex items-center text-[var(--color-primary)] text-sm font-medium">
              Acessar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/comprador/buscas-salvas" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Buscas Salvas</h3>
            <p className="text-sm text-white/50 mb-4">Gerencie seus alertas de novos anúncios.</p>
            <div className="flex items-center text-blue-400 text-sm font-medium">
              Configurar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/comprador/negociacoes" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Negociações</h3>
            <p className="text-sm text-white/50 mb-4">Acompanhe suas conversas com vendedores.</p>
            <div className="flex items-center text-purple-400 text-sm font-medium">
              Ver Chat <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Activity (Mocked for now) */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Vistos Recentemente</h2>
            <Link href="/" className="text-[var(--color-primary)] text-sm font-medium hover:underline">
              Ver Catálogo
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/50">Nenhuma atividade recente.</p>
            <Link href="/" className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--color-primary)] text-black font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
              Explorar Peças
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
