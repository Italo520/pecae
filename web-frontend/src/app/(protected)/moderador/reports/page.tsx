'use client';

import { AlertTriangle, UserX, MessageSquareOff, Trash2, Check, Filter, Loader2 } from 'lucide-react';
import { useModerationReports } from '@/hooks/useModeration';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DenunciasPage() {
  const { data: reports, isLoading, resolve } = useModerationReports();
  const pendingReports = reports || [];

  const getSeverityColor = (gravidade: string) => {
    const g = gravidade?.toUpperCase();
    if (g === 'ALTA' || g === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (g === 'MEDIA' || g === 'MEDIUM') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (g === 'BAIXA' || g === 'LOW') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-white/10 text-white border-white/20';
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              Central de Denúncias
            </h1>
            <p className="text-white/60">
              Analise tickets abertos por usuários sobre anúncios ou comportamentos suspeitos.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 cursor-not-allowed">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar Gravidade</span>
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
          </div>
        ) : pendingReports.length === 0 ? (
          <EmptyState 
            icon={<Check className="w-12 h-12" />}
            title="Inbox Zerada"
            description="Nenhuma denúncia pendente de moderação no momento."
          />
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report: any) => (
              <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start hover:bg-white/10 transition-colors">
                
                {/* Info Column */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getSeverityColor(report.severity || 'MEDIA')}`}>
                      RISCO {report.severity || 'MEDIA'}
                    </span>
                    <span className="text-xs text-white/40">Ticket #{report.id.slice(-6)}</span>
                    <span className="text-xs text-white/40">
                      • {report.createdAt ? new Date(report.createdAt).toLocaleString('pt-BR') : 'Recente'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{report.reason || 'Denúncia Padrão'}</h3>
                  <p className="text-sm text-white/70 mb-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    "{report.description || 'Sem descrição detalhada fornecida pelo usuário.'}"
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-white/40 mr-2">Denunciante:</span>
                      <span className="text-white font-medium">{report.reporter?.name || 'Usuário Anônimo'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 mr-2">Denunciado:</span>
                      <span className="text-blue-400 hover:underline cursor-pointer font-medium">{report.reportedEntity?.name || 'Alvo Oculto'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => resolve.mutate({ id: report.id, action: 'BAN_USER' })}
                    disabled={resolve.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {resolve.isPending && resolve.variables?.id === report.id && resolve.variables?.action === 'BAN_USER' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                    <span className="text-xs font-semibold">Banir Usuário</span>
                  </button>
                  <button 
                    onClick={() => resolve.mutate({ id: report.id, action: 'REMOVE_AD' })}
                    disabled={resolve.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {resolve.isPending && resolve.variables?.id === report.id && resolve.variables?.action === 'REMOVE_AD' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span className="text-xs font-semibold">Remover Anúncio</span>
                  </button>
                  <div className="h-px w-full bg-white/5 my-1" />
                  <button 
                    onClick={() => resolve.mutate({ id: report.id, action: 'DISMISS' })}
                    disabled={resolve.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    {resolve.isPending && resolve.variables?.id === report.id && resolve.variables?.action === 'DISMISS' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span className="text-xs font-semibold">Ignorar (Falso)</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
