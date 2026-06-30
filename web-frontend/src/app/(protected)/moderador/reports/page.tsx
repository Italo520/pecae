'use client';

import { AlertTriangle, UserX, MessageSquareOff, Trash2, Check, Filter } from 'lucide-react';
import { useState } from 'react';

const REPORTS = [
  { id: '1001', autor: 'Carlos S.', denunciado: 'Auto Peças Rápido', motivo: 'Suspeita de Fraude', descricao: 'O vendedor pediu pagamento antecipado por fora do sistema e se recusou a usar o OLX Pay ou Mercado Pago.', data: 'Há 2 horas', gravidade: 'ALTA' },
  { id: '1002', autor: 'Mariana C.', denunciado: 'Sucata Gol G4', motivo: 'Anúncio Irregular', descricao: 'A peça anunciada não condiz com as fotos. Fui no local e era outra peça.', data: 'Há 5 horas', gravidade: 'MEDIA' },
  { id: '1003', autor: 'Oficina Central', denunciado: 'João Silva', motivo: 'Spam/Ofensa', descricao: 'Usuário me xingou no chat porque não dei desconto.', data: 'Ontem', gravidade: 'BAIXA' },
];

export default function DenunciasPage() {
  const [reports, setReports] = useState(REPORTS);

  const getSeverityColor = (gravidade: string) => {
    switch (gravidade) {
      case 'ALTA': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIA': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'BAIXA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const dismissReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
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

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar Gravidade</span>
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
              
              {/* Info Column */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getSeverityColor(report.gravidade)}`}>
                    RISCO {report.gravidade}
                  </span>
                  <span className="text-xs text-white/40">Ticket #{report.id}</span>
                  <span className="text-xs text-white/40">• {report.data}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{report.motivo}</h3>
                <p className="text-sm text-white/70 mb-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  "{report.descricao}"
                </p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-white/40 mr-2">Denunciante:</span>
                    <span className="text-white font-medium">{report.autor}</span>
                  </div>
                  <div>
                    <span className="text-white/40 mr-2">Denunciado:</span>
                    <span className="text-blue-400 hover:underline cursor-pointer font-medium">{report.denunciado}</span>
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors">
                  <UserX className="w-4 h-4" />
                  <span className="text-xs font-semibold">Banir Usuário</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">Remover Anúncio</span>
                </button>
                <div className="h-px w-full bg-white/5 my-1" />
                <button 
                  onClick={() => dismissReport(report.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold">Ignorar (Falso)</span>
                </button>
              </div>

            </div>
          ))}

          {reports.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <Check className="w-12 h-12 text-[var(--color-primary)]/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Inbox Zerada</h3>
              <p className="text-white/50">Nenhuma denúncia pendente de moderação.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
