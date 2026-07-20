'use client';

import { Megaphone, Plus, Activity, Target, PauseCircle, PlayCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateCampaignModal } from '@/components/ads/CreateCampaignModal';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function CampanhasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: campanhas, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/campaigns');
        return data;
      } catch (err) { return []; }
    }
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'campaigns', 'stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/campaigns/stats');
        return data;
      } catch (err) {
        return { active: 0, clicks: 0, revenue: 0 };
      }
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.patch(`/admin/campaigns/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      toast.success('Status da campanha atualizado');
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
    onError: () => toast.error('Erro ao atualizar status da campanha')
  });

  const columns: Column<any>[] = [
    {
      header: 'Nome da Campanha',
      cell: (item) => <div className="font-medium text-[var(--foreground)]">{item.name || item.nome}</div>
    },
    {
      header: 'Status',
      cell: (item) => (
        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold border ${item.status === 'ATIVA' || item.status === 'ACTIVE'
            ? 'bg-[var(--brand)]/20 text-[var(--brand)] border-[var(--brand)]/30'
            : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]'
          }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Cliques',
      cell: (item) => <div className="text-[var(--muted)]">{item.clicks || 0}</div>
    },
    {
      header: 'Orçamento',
      cell: (item) => <div className="text-[var(--foreground)]">R$ {item.budget || 0}</div>
    },
    {
      header: 'Ações',
      cell: (item) => {
        const isAtiva = item.status === 'ATIVA' || item.status === 'ACTIVE';
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleStatus.mutate({ id: item.id, status: isAtiva ? 'PAUSADA' : 'ATIVA' })}
              className="p-2 text-[var(--muted)] hover:text-[var(--brand)] transition-colors"
              title={isAtiva ? "Pausar" : "Ativar"}
            >
              {isAtiva ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[var(--brand)]" />
              Gestão de Campanhas
            </h1>
            <p className="text-[var(--muted)]">
              Administre os anúncios patrocinados e o faturamento da plataforma.
            </p>
          </div>

          <button 
            onClick={() => {
              console.log('BUTTON NOVA CAMPANHA CLICADO, SETANDO isModalOpen = true');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white font-medium rounded-lg hover:bg-[var(--brand-vibrant)]"
          >
            <Plus className="w-5 h-5" />
            Nova Campanha
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-[var(--brand-vibrant)]" />
              <h3 className="text-sm font-medium text-[var(--muted)]">Campanhas Ativas</h3>
            </div>
            {loadingStats ? <div className="h-9 w-16 shimmer rounded bg-[var(--surface)]" /> : (
              <p className="text-3xl font-semibold text-[var(--foreground)]">{stats?.active || 0}</p>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-[var(--brand-vibrant)]" />
              <h3 className="text-sm font-medium text-[var(--muted)]">Total de Cliques Mês</h3>
            </div>
            {loadingStats ? <div className="h-9 w-24 shimmer rounded bg-[var(--surface)]" /> : (
              <p className="text-3xl font-semibold text-[var(--foreground)]">{stats?.clicks || 0}</p>
            )}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-[var(--brand)]">R$</span>
              <h3 className="text-sm font-medium text-[var(--muted)]">Faturamento Previsto</h3>
            </div>
            {loadingStats ? <div className="h-9 w-32 shimmer rounded bg-[var(--surface)]" /> : (
              <p className="text-3xl font-semibold text-[var(--brand)]">{stats?.revenue || 0}</p>
            )}
          </div>
        </div>

        {/* Table */}
        {!isLoading && (!campanhas || campanhas.length === 0) ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md rounded-2xl">
            <EmptyState
              icon={<Megaphone className="w-8 h-8 text-[var(--brand)]" />}
              title="Nenhuma campanha ativa"
              description="Você ainda não possui campanhas rodando. Crie uma nova campanha para começar a patrocinar anúncios."
            />
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md rounded-2xl p-4 overflow-hidden">
            <DataTable
              data={campanhas || []}
              columns={columns}
              keyExtractor={(i) => i.id}
              isLoading={isLoading}
            />
          </div>
        )}

        <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      </div>
    </div>
  );
}
