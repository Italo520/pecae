'use client';

import { Megaphone, Plus, ExternalLink, Activity, Target } from 'lucide-react';
import Link from 'next/link';

const CAMPANHAS = [
  { id: '1', nome: 'Destaque Mês Julho', status: 'ATIVA', cliques: 1240, orcamento: 'R$ 500,00', gasto: 'R$ 210,50' },
  { id: '2', nome: 'Banners Home (Motores)', status: 'PAUSADA', cliques: 850, orcamento: 'R$ 300,00', gasto: 'R$ 300,00' },
  { id: '3', nome: 'VIP Busca', status: 'ATIVA', cliques: 3200, orcamento: 'R$ 1.000,00', gasto: 'R$ 450,00' },
];

export default function CampanhasPage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[var(--color-primary)]" />
              Gestão de Campanhas VIP
            </h1>
            <p className="text-white/60">
              Administre os anúncios patrocinados e o faturamento da plataforma.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black rounded-xl font-semibold transition-colors">
            <Plus className="w-5 h-5" />
            Nova Campanha
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-medium text-white/50">Campanhas Ativas</h3>
            </div>
            <p className="text-3xl font-semibold text-white">2</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-white/50">Total de Cliques Mês</h3>
            </div>
            <p className="text-3xl font-semibold text-white">5.290</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-[var(--color-primary)]">R$</span>
              <h3 className="text-sm font-medium text-white/50">Faturamento Previsto</h3>
            </div>
            <p className="text-3xl font-semibold text-[var(--color-primary)]">1.800,00</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
            <div className="col-span-4">Nome da Campanha</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Cliques</div>
            <div className="col-span-3 text-right">Gasto / Orçamento</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          <div className="divide-y divide-white/5">
            {CAMPANHAS.map((campanha) => (
              <div key={campanha.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                
                <div className="col-span-4 font-medium text-white">
                  {campanha.nome}
                </div>

                <div className="col-span-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold border ${
                    campanha.status === 'ATIVA' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-white/10 text-white/50 border-white/20'
                  }`}>
                    {campanha.status}
                  </span>
                </div>

                <div className="col-span-2 text-right text-sm text-white/70">
                  {campanha.cliques.toLocaleString('pt-BR')}
                </div>

                <div className="col-span-3 text-right text-sm">
                  <span className="text-white">{campanha.gasto}</span>
                  <span className="text-white/30 mx-1">/</span>
                  <span className="text-white/50">{campanha.orcamento}</span>
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <button className="p-2 text-white/40 hover:text-[var(--color-primary)] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
