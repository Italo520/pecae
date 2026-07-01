'use client';

import { Megaphone, Plus, ExternalLink, Activity, Target, PauseCircle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { DataTable, Column } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonKPI } from '@/components/ui/Skeleton';

export default function CampanhasPage() {
  const queryClient = useQueryClient();

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
      cell: (item) => <div className="font-medium text-white">{item.name || item.nome}</div>
    },
    {
      header: 'Status',
      cell: (item) => (
        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold border ${
          item.status === 'ATIVA' || item.status === 'ACTIVE'
            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
            : 'bg-white/10 text-white/50 border-white/20'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Cliques',
      cell: (item) => <div className="text-white/70">{item.clicks || 0}</div>
    },
    {
      header: 'Orçamento',
      cell: (item) => <div className="text-white">R$ {item.budget || 0}</div>
    },
    {
      header: 'Ações',
      cell: (item) => {
        const isAtiva = item.status === 'ATIVA' || item.status === 'ACTIVE';
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleStatus.mutate({ id: item.id, status: isAtiva ? 'PAUSADA' : 'ATIVA' })}
              className="p-2 text-white/40 hover:text-white transition-colors"
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
            {loadingStats ? <div className="h-9 w-16 shimmer rounded bg-white/5" /> : (
              <p className="text-3xl font-semibold text-white">{stats?.active || 0}</p>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-white/50">Total de Cliques Mês</h3>
            </div>
            {loadingStats ? <div className="h-9 w-24 shimmer rounded bg-white/5" /> : (
              <p className="text-3xl font-semibold text-white">{stats?.clicks || 0}</p>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-[var(--color-primary)]">R$</span>
              <h3 className="text-sm font-medium text-white/50">Faturamento Previsto</h3>
            </div>
            {loadingStats ? <div className="h-9 w-32 shimmer rounded bg-white/5" /> : (
              <p className="text-3xl font-semibold text-[var(--color-primary)]">{stats?.revenue || 0}</p>
            )}
          </div>
        </div>

        {/* Table */}
        {!isLoading && (!campanhas || campanhas.length === 0) ? (
          <EmptyState 
            icon={<Megaphone className="w-8 h-8" />}
            title="Nenhuma campanha ativa"
            description="Você ainda não possui campanhas rodando. Crie uma nova campanha para começar a patrocinar anúncios."
          />
        ) : (
          <DataTable 
            data={campanhas || []} 
            columns={columns} 
            keyExtractor={(i) => i.id} 
            isLoading={isLoading} 
          />
        )}

      </div>
    </div>
  );
}
