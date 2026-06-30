'use client';

import { Search, Bell, BellOff, Trash2, Edit2, AlertCircle } from 'lucide-react';

// Mock data
const BUSCAS = [
  { id: '1', query: 'Motor AP 1.8 Flex', filtros: 'Ano: 2005-2010', ativo: true, resultadosHoje: 3 },
  { id: '2', query: 'Farol Onix 2021 Lado Direito', filtros: 'Apenas Originais', ativo: true, resultadosHoje: 0 },
  { id: '3', query: 'Parachoque dianteiro Corolla', filtros: 'Cor: Prata', ativo: false, resultadosHoje: 0 },
];

export default function BuscasSalvasPage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-400" />
              Buscas Salvas
            </h1>
            <p className="text-white/60">
              Gerencie seus alertas para ser notificado sobre novas peças.
            </p>
          </div>
          
          <button className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Nova Busca
          </button>
        </div>

        {/* Content */}
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          
          {/* List Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
            <div className="col-span-5 md:col-span-4">Termo Buscado</div>
            <div className="col-span-4 hidden md:block">Filtros Ativos</div>
            <div className="col-span-3 text-center">Notificações</div>
            <div className="col-span-4 md:col-span-1 text-right">Ações</div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-white/5">
            {BUSCAS.map((busca) => (
              <div key={busca.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                
                {/* Query */}
                <div className="col-span-5 md:col-span-4">
                  <h3 className="text-sm font-medium text-white mb-1">{busca.query}</h3>
                  {busca.resultadosHoje > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      <AlertCircle className="w-3 h-3" />
                      {busca.resultadosHoje} novos hoje
                    </span>
                  )}
                </div>

                {/* Filters */}
                <div className="col-span-4 hidden md:block">
                  <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
                    {busca.filtros}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-3 text-center">
                  <button 
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      busca.ativo 
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {busca.ativo ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    {busca.ativo ? 'Ativas' : 'Pausadas'}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-2">
                  <button className="p-2 text-white/40 hover:text-blue-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
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
