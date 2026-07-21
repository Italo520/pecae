'use client';

import { FileText, CheckCircle, XCircle, Eye, ShieldAlert, Building2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useModerationVerifications } from '@/hooks/useModeration';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DocumentosModeracaoPage() {
  const { data: docs, isLoading, approve, reject } = useModerationVerifications();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const pendingDocs = docs || [];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-orange-400" />
              Moderação de KYC
            </h1>
            <p className="text-[var(--muted)]">
              Aprove ou rejeite documentos de credenciamento enviados por desmanches.
            </p>
          </div>

          {/* Filters/Tabs */}
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
            <button className="text-[var(--brand)] font-medium border-b-2 border-[var(--brand)] pb-4 -mb-[17px] px-2">
              Pendentes ({pendingDocs.length})
            </button>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium pb-4 -mb-[17px] px-2 transition-colors cursor-not-allowed">
              Aprovados Recentes
            </button>
            <button className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium pb-4 -mb-[17px] px-2 transition-colors cursor-not-allowed">
              Rejeitados
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-[var(--brand)] animate-spin" />
            </div>
          ) : pendingDocs.length === 0 ? (
            <EmptyState 
              icon={<CheckCircle className="w-12 h-12" />}
              title="Tudo limpo!"
              description="Não há documentos pendentes de aprovação no momento."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingDocs.map((doc: any) => (
                <div key={doc.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col hover:bg-[var(--surface-hover)] transition-colors">
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-400/20 text-orange-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-[var(--foreground)] font-semibold truncate">{doc.user?.name || 'Desmanche'}</h3>
                        <p className="text-xs text-[var(--muted)] truncate">CNPJ: {doc.businessData?.cnpj || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--background)] rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--muted)]">Tipo de Documento</span>
                      <span className="text-xs font-medium text-[var(--foreground)]">{doc.documentType || 'KYC'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted)]">Enviado em</span>
                      <span className="text-xs text-[var(--foreground)]">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleString('pt-BR') : 'Recente'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                      title="Visualizar Detalhes"
                    >
                      <Eye className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium">Analisar</span>
                    </button>
                    <button 
                      onClick={() => reject.mutate({ id: doc.id })}
                      disabled={reject.isPending && reject.variables?.id === doc.id}
                      className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {reject.isPending && reject.variables?.id === doc.id ? (
                        <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5 mb-1" />
                      )}
                      <span className="text-[10px] font-medium">Rejeitar</span>
                    </button>
                    <button 
                      onClick={() => approve.mutate(doc.id)}
                      disabled={approve.isPending && approve.variables === doc.id}
                      className="col-span-1 flex flex-col items-center justify-center py-2 rounded-xl bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors disabled:opacity-50"
                    >
                      {approve.isPending && approve.variables === doc.id ? (
                        <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mb-1" />
                      )}
                      <span className="text-[10px] font-medium">Aprovar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over */}
      {selectedDoc && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDoc(null)}
          />
          {/* Panel */}
          <div className="w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Análise de Documento</h2>
              <button onClick={() => setSelectedDoc(null)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full bg-[var(--background)] hover:bg-[var(--surface-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-[var(--muted)] mb-1">Empresa</h3>
                <p className="text-base text-[var(--foreground)]">{selectedDoc.user?.name || 'Desmanche'}</p>
                <p className="text-sm text-[var(--muted)]">CNPJ: {selectedDoc.businessData?.cnpj || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Imagens Enviadas</h3>
                {selectedDoc.documentUrls?.length ? (
                  <div className="space-y-4">
                    {selectedDoc.documentUrls.map((url: string, i: number) => (
                      <div key={i} className="aspect-[4/3] rounded-xl bg-[var(--background)] overflow-hidden border border-[var(--border)] flex items-center justify-center relative group">
                        {url.endsWith('.pdf') ? (
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-[var(--muted)] mx-auto mb-2" />
                            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-[var(--brand)] hover:underline">
                              Abrir PDF Externo
                            </a>
                          </div>
                        ) : (
                          <img src={url} alt={`Doc ${i+1}`} className="w-full h-full object-contain" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-[var(--border)] rounded-xl text-center text-[var(--muted)] text-sm">
                    Nenhuma imagem vinculada.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--background)] flex gap-4">
              <button 
                onClick={() => {
                  reject.mutate({ id: selectedDoc.id });
                  setSelectedDoc(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors"
              >
                Rejeitar
              </button>
              <button 
                onClick={() => {
                  approve.mutate(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="flex-1 py-3 rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold hover:opacity-90 transition-colors"
              >
                Aprovar KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
