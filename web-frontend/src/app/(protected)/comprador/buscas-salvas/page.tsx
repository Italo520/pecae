'use client';

import { Search, Bell, BellOff, Trash2, AlertCircle } from 'lucide-react';
import { useSavedSearches, SavedSearch } from '../../../../hooks/useSavedSearches';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { toast } from 'sonner';

export default function BuscasSalvasPage() {
  const { getSavedSearches, deleteSavedSearch, toggleSavedSearchAlert } = useSavedSearches();
  const { data: buscas, isLoading } = getSavedSearches;

  const handleDelete = (id: string) => {
    deleteSavedSearch.mutate(id, {
      onSuccess: () => toast.success('Busca salva excluída'),
      onError: () => toast.error('Erro ao excluir busca'),
    });
  };

  const handleToggleAlert = (id: string, currentStatus: boolean) => {
    toggleSavedSearchAlert.mutate({ id, alertActive: !currentStatus }, {
      onSuccess: () => toast.success(currentStatus ? 'Alertas pausados' : 'Alertas ativados'),
      onError: () => toast.error('Erro ao atualizar alerta'),
    });
  };

  const columns: Column<SavedSearch>[] = [
    {
      header: 'Termo Buscado',
      cell: (item) => (
        <div>
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">{item.query || 'Sem termo específico'}</h3>
          {/* Mocado resultadoshoje = 0 para simular o mesmo layout */}
        </div>
      ),
    },
    {
      header: 'Filtros Ativos',
      cell: (item) => (
        <span className="text-xs text-[var(--muted)] bg-[var(--surface)] px-2 py-1 rounded-md border border-[var(--border)]">
          {JSON.stringify(item.filters) === '{}' ? 'Sem filtros' : Object.keys(item.filters).join(', ')}
        </span>
      ),
    },
    {
      header: 'Notificações',
      cell: (item) => (
        <button 
          onClick={() => handleToggleAlert(item.id, item.alertActive)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            item.alertActive 
              ? 'bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20' 
              : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          {item.alertActive ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {item.alertActive ? 'Ativas' : 'Pausadas'}
        </button>
      ),
    },
    {
      header: 'Ações',
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleDelete(item.id)} className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
              <Search className="w-8 h-8 text-[var(--brand)]" />
              Buscas Salvas
            </h1>
            <p className="text-[var(--muted)]">
              Gerencie seus alertas para ser notificado sobre novas peças.
            </p>
          </div>
        </div>

        {/* Content */}
        {!isLoading && (!buscas || buscas.length === 0) ? (
          <EmptyState 
            icon={<Search className="w-8 h-8" />}
            title="Nenhuma busca salva"
            description="Faça uma busca no catálogo e salve para ser alertado quando novos produtos chegarem."
          />
        ) : (
          <DataTable 
            data={buscas || []} 
            columns={columns} 
            keyExtractor={(i) => i.id} 
            isLoading={isLoading} 
          />
        )}

      </div>
    </div>
  );
}
