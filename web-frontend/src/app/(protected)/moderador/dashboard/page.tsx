'use client';

import { 
  Users, 
  Car, 
  FileText, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { StatsCard } from '@/components/ui/StatsCard';
import { SkeletonKPI } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ModeradorDashboard() {
  // Fetch overview stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/stats');
        return data;
      } catch (err) {
        // Fallback for when endpoint is not ready
        return { activeUsers: 0, activeListings: 0, pendingDocs: 0, openReports: 0 };
      }
    }
  });

  // Fetch pending docs
  const { data: pendingDocs, isLoading: loadingDocs } = useQuery({
    queryKey: ['admin', 'kyc', 'pending', 'preview'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/kyc/pending?limit=5');
        return data;
      } catch (err) { return []; }
    }
  });

  // Fetch recent reports
  const { data: recentReports, isLoading: loadingReports } = useQuery({
    queryKey: ['admin', 'reports', 'recent'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/reports?limit=5');
        return data;
      } catch (err) { return []; }
    }
  });

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
          {loadingStats ? (
            <>
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
            </>
          ) : (
            <>
              <StatsCard 
                title="Usuários Ativos" 
                value={stats?.activeUsers || 0} 
                icon={<Users className="w-5 h-5 text-blue-400" />} 
              />
              <StatsCard 
                title="Anúncios Ativos" 
                value={stats?.activeListings || 0} 
                icon={<Car className="w-5 h-5 text-[var(--color-primary)]" />} 
              />
              <StatsCard 
                title="Documentos Pendentes" 
                value={stats?.pendingDocs || 0} 
                icon={<FileText className="w-5 h-5 text-orange-400" />} 
              />
              <StatsCard 
                title="Denúncias Abertas" 
                value={stats?.openReports || 0} 
                icon={<AlertTriangle className="w-5 h-5 text-red-400" />} 
              />
            </>
          )}
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
            
            {loadingDocs ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl shimmer" />)}
              </div>
            ) : !pendingDocs?.length ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
                <FileText className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">Nenhum documento pendente no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDocs.map((doc: any) => (
                  <div key={doc.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                     <FileText className="w-5 h-5 text-orange-400" />
                     <div>
                       <h4 className="text-sm font-medium text-white mb-1">{doc.user?.name || 'Usuário'}</h4>
                       <p className="text-xs text-white/50">{doc.documentType}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Denúncias Recentes</h2>
              <Link href="/moderador/reports" className="text-sm text-red-400 hover:underline flex items-center">
                Ver Todas <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {loadingReports ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl shimmer" />)}
              </div>
            ) : !recentReports?.length ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
                <AlertTriangle className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">Nenhuma denúncia aberta.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports.map((rep: any) => (
                  <div key={rep.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Suspeita #{rep.id?.slice(-4) || 'N/A'}</h4>
                      <p className="text-xs text-white/50 line-clamp-1">{rep.reason || 'Sem descrição'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
