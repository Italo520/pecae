'use client';

import { FileText, CheckCircle, XCircle, Eye, ShieldAlert, Building2 } from 'lucide-react';
import { useState } from 'react';

// Mock data
const DOCUMENTS = [
  { id: '1', loja: 'Desmanche do João', cnpj: '12.345.678/0001-99', status: 'PENDENTE', dataEnvio: '2026-06-29T10:30:00Z', tipo: 'Alvará e CNPJ' },
  { id: '2', loja: 'Auto Peças Rápido', cnpj: '98.765.432/0001-11', status: 'PENDENTE', dataEnvio: '2026-06-28T14:15:00Z', tipo: 'Credenciamento Detran' },
  { id: '3', loja: 'Sucatas Brasil', cnpj: '45.123.890/0001-55', status: 'ANALISANDO', dataEnvio: '2026-06-27T09:00:00Z', tipo: 'Fotos do Galpão' },
];

export default function DocumentosModeracaoPage() {
  const [docs, setDocs] = useState(DOCUMENTS);

  const handleApprove = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
    // Here we would call the API to approve
  };

  const handleReject = (id: string) => {
    setDocs(docs.filter(d => d.id !== id));
    // Here we would call the API to reject
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-orange-400" />
            Moderação de KYC
          </h1>
          <p className="text-white/60">
            Aprove ou rejeite documentos de credenciamento enviados por desmanches.
          </p>
        </div>

        {/* Filters/Tabs */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <button className="text-[var(--color-primary)] font-medium border-b-2 border-[var(--color-primary)] pb-4 -mb-[17px] px-2">
            Pendentes ({docs.length})
          </button>
          <button className="text-white/40 hover:text-white font-medium pb-4 -mb-[17px] px-2 transition-colors">
            Aprovados Recentes
          </button>
          <button className="text-white/40 hover:text-white font-medium pb-4 -mb-[17px] px-2 transition-colors">
            Rejeitados
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-400/20 text-orange-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{doc.loja}</h3>
                    <p className="text-xs text-white/50">CNPJ: {doc.cnpj}</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">Tipo de Documento</span>
                  <span className="text-xs font-medium text-white">{doc.tipo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Enviado em</span>
                  <span className="text-xs text-white/70">{new Date(doc.dataEnvio).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2">
                <button 
                  className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                  title="Visualizar PDF/Imagem"
                >
                  <Eye className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Visualizar</span>
                </button>
                <button 
                  onClick={() => handleReject(doc.id)}
                  className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <XCircle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Rejeitar</span>
                </button>
                <button 
                  onClick={() => handleApprove(doc.id)}
                  className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Aprovar</span>
                </button>
              </div>

            </div>
          ))}

          {docs.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-[var(--color-primary)]/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Tudo limpo!</h3>
              <p className="text-white/50">Não há documentos pendentes de aprovação no momento.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
