'use client';

import { useVehicles } from '@/hooks/useVehicles';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { 
  Car, 
  CheckCircle2, 
  ShoppingCart, 
  Plus, 
  Search, 
  MoreVertical,
  Activity,
  Archive,
  Clock
} from 'lucide-react';
import { useState, useMemo } from 'react';

import Image from 'next/image';

export default function DashboardClient() {
  const { user } = useAuthStore();
  const { data: vehicles, isLoading, isError } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    if (!vehicles) return { total: 0, active: 0, sold: 0 };
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'ACTIVE').length,
      sold: vehicles.filter(v => v.status === 'SOLD').length
    };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    if (!searchTerm) return vehicles;
    const s = searchTerm.toLowerCase();
    return vehicles.filter(v => 
      v.brand.toLowerCase().includes(s) || 
      v.model.toLowerCase().includes(s) || 
      v.plate.toLowerCase().includes(s)
    );
  }, [vehicles, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ativo</span>;
      case 'IN_MODERATION': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> Em Moderação</span>;
      case 'SOLD': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Vendido</span>;
      case 'ARCHIVED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 flex items-center gap-1"><Archive className="w-3 h-3" /> Arquivado</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-white tracking-wide">
            Olá, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-white/60 mt-1">Gerencie seu inventário de sucatas e peças.</p>
        </div>
        <Link 
          href="/vendedor/anunciar"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_25px_rgba(20,241,149,0.5)]"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Sucata</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-white/70">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-white">{stats.total}</span>
          </div>
          <h3 className="text-white/60 font-medium relative z-10">Total de Veículos</h3>
        </div>
        
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-emerald-400">{stats.active}</span>
          </div>
          <h3 className="text-emerald-400/80 font-medium relative z-10">Anúncios Ativos</h3>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-blue-400">{stats.sold}</span>
          </div>
          <h3 className="text-blue-400/80 font-medium relative z-10">Veículos Vendidos</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/40 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-primary)]" />
            Meu Inventário
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar por placa, modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all"
            />
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-64 text-red-400">
              Erro ao carregar veículos. Tente novamente.
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Nenhum veículo encontrado</h3>
              <p className="text-white/50 text-sm max-w-sm mb-6">
                {searchTerm ? 'Nenhum veículo corresponde à sua busca.' : 'Você ainda não cadastrou nenhum veículo no seu inventário.'}
              </p>
              {!searchTerm && (
                <Link 
                  href="/vendedor/anunciar"
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                >
                  Cadastrar Primeiro Veículo &rarr;
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Veículo</th>
                  <th className="px-6 py-4 font-medium">Placa</th>
                  <th className="px-6 py-4 font-medium">Preço (Sucata)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0 relative">
                          {vehicle.mainImage ? (
                            <Image 
                              src={vehicle.mainImage} 
                              alt={vehicle.model} 
                              fill 
                              sizes="48px"
                              className="object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-5 h-5 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[var(--color-primary)] transition-colors">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-xs text-white/50">{vehicle.version} • {vehicle.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70 font-mono text-xs uppercase">
                      {vehicle.plate || '---'}
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium">
                      {vehicle.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price) : 'Sob Consulta'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
