'use client';

import { useState } from 'react';
import { useSeller } from '@/hooks/useSeller';
import { BarChart3, Eye, MessageSquare, TrendingUp, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const { useSellerAnalytics } = useSeller();
  const { data, isLoading, isError } = useSellerAnalytics(periodDays);

  const formatPercentage = (val?: number) => {
    if (val == null) return '0.0%';
    return `${val.toFixed(1)}%`;
  };

  const getMaxValue = () => {
    if (!data?.historico || data.historico.length === 0) return 10;
    const maxVal = Math.max(...data.historico.map((h: any) => h.totalVisualizacoes));
    return maxVal > 0 ? maxVal : 10;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)] mr-2" />
        Carregando analíticos comerciais...
      </div>
    );
  }

  const maxVal = getMaxValue();
  const hist = data?.historico || [];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-24">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/vendedor/dashboard"
              className="w-10 h-10 rounded-full hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-[var(--foreground)] tracking-wide flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-[var(--brand)]" />
                Desempenho Comercial
              </h1>
              <p className="text-[var(--muted)]">Monitore estatísticas de visualizações e contatos.</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl">
            {[
              { label: '7 dias', val: 7 },
              { label: '30 dias', val: 30 },
              { label: '90 dias', val: 90 },
            ].map(p => (
              <button
                key={p.val}
                onClick={() => setPeriodDays(p.val)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  periodDays === p.val 
                    ? 'bg-[var(--brand)] text-black shadow-md' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-[var(--surface-hover)] rounded-xl text-[var(--muted)]">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-3xl font-display font-semibold text-[var(--foreground)]">
                {data?.totalVisualizacoes || 0}
              </span>
            </div>
            <h3 className="text-[var(--muted)] font-medium relative z-10">Total de Visualizações</h3>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-[var(--surface-hover)] rounded-xl text-[var(--muted)]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-3xl font-display font-semibold text-[var(--foreground)]">
                {data?.totalContatos || 0}
              </span>
            </div>
            <h3 className="text-[var(--muted)] font-medium relative z-10">Inícios de Negociação</h3>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--brand)]/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-[var(--brand)]/10 rounded-xl text-[var(--brand)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-3xl font-display font-semibold text-[var(--brand)]">
                {formatPercentage(data?.taxaConversao)}
              </span>
            </div>
            <h3 className="text-[var(--brand)]/80 font-medium relative z-10">Taxa de Conversão</h3>
          </div>

        </div>

        {/* Chart representation */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--brand)]" />
            Histórico Diário de Acessos
          </h2>

          <div className="h-64 flex items-end gap-2 sm:gap-4 border-b border-[var(--border)] pb-2 overflow-x-auto">
            {hist.map((h: any, idx: number) => {
              const heightPct = `${(h.totalVisualizacoes / maxVal) * 100}%`;
              const dateParts = h.dataReferencia.split('-');
              const dateLabel = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : h.dataReferencia;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center min-w-[32px] group">
                  <div className="text-[10px] text-[var(--muted)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h.totalVisualizacoes} views
                  </div>
                  <div 
                    style={{ height: heightPct || '4px' }} 
                    className="w-full bg-[var(--brand)]/40 group-hover:bg-[var(--brand)] rounded-t-md transition-all shadow-[0_0_15px_rgba(20,241,149,0.1)] group-hover:shadow-[0_0_20px_rgba(20,241,149,0.3)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--muted)] mt-2 font-mono">{dateLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-medium text-[var(--foreground)]">Tabela de Métricas Detalhada</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider bg-[var(--background)]/30">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Visualizações</th>
                  <th className="px-6 py-4">Inícios de Chat</th>
                  <th className="px-6 py-4">Taxa de Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {hist.map((h: any, idx: number) => {
                  const rate = h.totalVisualizacoes > 0 ? (h.totalContatos / h.totalVisualizacoes) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-[var(--surface-hover)] transition-colors text-sm text-[var(--foreground)]">
                      <td className="px-6 py-4 font-mono">{h.dataReferencia}</td>
                      <td className="px-6 py-4 font-semibold">{h.totalVisualizacoes}</td>
                      <td className="px-6 py-4 font-semibold">{h.totalContatos}</td>
                      <td className="px-6 py-4 font-semibold text-[var(--brand)]">{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
