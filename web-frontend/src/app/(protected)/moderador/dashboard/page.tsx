'use client';

import { 
  Users, 
  Car, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function ModeradorDashboard() {
  const kpis = [
    { label: 'Usuários Ativos', value: '45.2k', icon: Users, change: '+12%', color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Anúncios Ativos', value: '12.4k', icon: Car, change: '+5%', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/20' },
    { label: 'Documentos Pendentes', value: '142', icon: FileText, change: '-2%', color: 'text-orange-400', bg: 'bg-orange-400/20' },
    { label: 'Denúncias Abertas', value: '28', icon: AlertTriangle, change: '+1%', color: 'text-red-400', bg: 'bg-red-400/20' },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Visão Geral da Plataforma
          </h1>
          <p className="text-white/60">
            Acompanhe as principais métricas e pendências de moderação.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isPositive = kpi.change.startsWith('+');
            return (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${kpi.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-white/50 mb-1">{kpi.label}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-semibold text-white">{kpi.value}</p>
                    <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.change}
                      {isPositive ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingUp className="w-3 h-3 ml-1 rotate-180" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Required Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          {/* Recent Documents */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Documentos Pendentes (KYC)</h2>
              <Link href="/moderador/documentos" className="text-sm text-[var(--color-primary)] hover:underline flex items-center">
                Ver Todos <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
              <FileText className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">Existem 142 documentos aguardando validação manual de CNPJ e Fotos.</p>
              <Link href="/moderador/documentos" className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
                Iniciar Validação
              </Link>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Denúncias Recentes</h2>
              <Link href="/moderador/reports" className="text-sm text-red-400 hover:underline flex items-center">
                Ver Todas <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Suspeita de Fraude #{1000 + i}</h4>
                    <p className="text-xs text-white/50 line-clamp-1">Usuário reportou que o vendedor está exigindo pagamento por fora da plataforma.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
