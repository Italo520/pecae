'use client';

import { useVehicles, useDeleteVehicle, usePauseVehicle, useRepublishVehicle, useSoldVehicle } from '@/hooks/useVehicles';
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
  Clock,
  Trash2,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

function VehicleRow({ 
  vehicle, 
  getStatusBadge,
  onPauseRequest,
  onRepublishRequest,
  onSoldRequest,
  onDeleteRequest
}: { 
  vehicle: any, 
  getStatusBadge: (status: string) => JSX.Element,
  onPauseRequest: (vehicle: any) => void,
  onRepublishRequest: (vehicle: any) => void,
  onSoldRequest: (vehicle: any) => void,
  onDeleteRequest: (vehicle: any) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr 
      className="hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer relative"
      onClick={(e) => {
        e.preventDefault();
        toast.info('A página de detalhes do veículo para vendedores será adicionada em breve!');
      }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] overflow-hidden flex-shrink-0 relative">
            {vehicle.mainImage ? (
              <img 
                src={vehicle.mainImage} 
                alt={vehicle.model} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-5 h-5 text-[var(--muted)]" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] group-hover:text-[var(--brand)] transition-colors">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-xs text-[var(--muted)]">{vehicle.version} • {vehicle.year}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[var(--muted)] font-mono text-xs uppercase">
        {vehicle.plate || '---'}
      </td>
      <td className="px-6 py-4 text-[var(--foreground)] font-medium">
        {vehicle.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price) : 'Sob Consulta'}
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(vehicle.status)}
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${menuOpen ? 'bg-[var(--surface-hover)] text-[var(--foreground)]' : 'hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div 
            className="absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-[60] overflow-hidden flex flex-col p-1 animate-in fade-in slide-in-from-right-2 duration-200"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info('Funcionalidade de edição em breve!'); setMenuOpen(false); }}
              className="text-left px-3 py-2.5 text-sm hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Editar
            </button>

            {vehicle.status === 'ACTIVE' && (
              <>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPauseRequest(vehicle); setMenuOpen(false); }}
                  className="text-left px-3 py-2.5 text-sm hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Pause className="w-4 h-4 text-amber-500" />
                  Pausar Anúncio
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSoldRequest(vehicle); setMenuOpen(false); }}
                  className="text-left px-3 py-2.5 text-sm hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Marcar Vendido
                </button>
              </>
            )}

            {(vehicle.status === 'INACTIVE' || vehicle.status === 'PAUSED') && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRepublishRequest(vehicle); setMenuOpen(false); }}
                className="text-left px-3 py-2.5 text-sm hover:bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <RotateCcw className="w-4 h-4 text-emerald-500" />
                Republicar Anúncio
              </button>
            )}

            <div className="h-px bg-[var(--border)] my-1" />
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteRequest(vehicle);
                setMenuOpen(false);
              }}
              className="text-left px-3 py-2.5 text-sm hover:bg-red-500/10 text-red-500 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-16 h-16" style={{ width: 16, height: 16 }} />
              Excluir
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function DashboardClient() {
  const { user } = useAuthStore();
  const { data: vehicles, isLoading, isError } = useVehicles();
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const { mutate: pauseVehicle } = usePauseVehicle();
  const { mutate: republishVehicle } = useRepublishVehicle();
  const { mutate: soldVehicle } = useSoldVehicle();

  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);

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
      case 'ACTIVE': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Ativo</span>;
      case 'PENDING':
      case 'IN_MODERATION': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> Em Moderação</span>;
      case 'SOLD': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Vendido</span>;
      case 'INACTIVE':
      case 'PAUSED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 flex items-center gap-1"><Pause className="w-3 h-3" /> Pausado</span>;
      case 'ARCHIVED': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 flex items-center gap-1"><Archive className="w-3 h-3" /> Arquivado</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--surface-hover)] text-[var(--muted)]">{status}</span>;
    }
  };

  const handlePause = (vehicle: any) => {
    pauseVehicle(vehicle.id, {
      onSuccess: () => {
        toast.success('Anúncio pausado com sucesso!');
      },
      onError: (err: any) => {
        toast.error('Erro ao pausar anúncio: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleRepublish = (vehicle: any) => {
    republishVehicle(vehicle.id, {
      onSuccess: () => {
        toast.success('Anúncio enviado para moderação!');
      },
      onError: (err: any) => {
        toast.error('Erro ao republicar anúncio: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleSold = (vehicle: any) => {
    soldVehicle(vehicle.id, {
      onSuccess: () => {
        toast.success('Veículo marcado como vendido!');
      },
      onError: (err: any) => {
        toast.error('Erro ao marcar como vendido: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id, {
        onSuccess: () => {
          toast.success('Veículo excluído com sucesso!');
          setVehicleToDelete(null);
        },
        onError: () => {
          toast.error('Erro ao excluir veículo. Tente novamente.');
        }
      });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--foreground)] tracking-wide">
            Olá, {user?.name?.split(' ')[0] || 'Vendedor'}
          </h1>
          <p className="text-[var(--muted)] mt-1">Gerencie seu inventário de sucatas e peças.</p>
        </div>
        <Link 
          href="/vendedor/anunciar"
          className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Sucata</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-[var(--surface-hover)] rounded-xl text-[var(--muted)]">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-[var(--foreground)]">{stats.total}</span>
          </div>
          <h3 className="text-[var(--muted)] font-medium relative z-10">Total de Veículos</h3>
        </div>
        
        <div className="bg-[var(--surface)] border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-emerald-500">{stats.active}</span>
          </div>
          <h3 className="text-emerald-500/80 font-medium relative z-10">Anúncios Ativos</h3>
        </div>

        <div className="bg-[var(--surface)] border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="text-3xl font-display font-semibold text-blue-500">{stats.sold}</span>
          </div>
          <h3 className="text-blue-500/80 font-medium relative z-10">Veículos Vendidos</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl backdrop-blur-xl flex flex-col h-[500px] shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row gap-4 items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-medium text-[var(--foreground)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--brand)]" />
            Meu Inventário
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input 
              type="text" 
              placeholder="Buscar por placa, modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
            />
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              Erro ao carregar veículos. Tente novamente.
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-[var(--muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">Nenhum veículo encontrado</h3>
              <p className="text-[var(--muted)] text-sm max-w-sm mb-6">
                {searchTerm ? 'Nenhum veículo corresponde à sua busca.' : 'Você ainda não cadastrou nenhum veículo no seu inventário.'}
              </p>
              {!searchTerm && (
                <Link 
                  href="/vendedor/anunciar"
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  Cadastrar Primeiro Veículo &rarr;
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--surface-hover)] text-[var(--muted)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Veículo</th>
                  <th className="px-6 py-4 font-medium">Placa</th>
                  <th className="px-6 py-4 font-medium">Preço (Sucata)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredVehicles.map((vehicle) => (
                  <VehicleRow 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    getStatusBadge={getStatusBadge} 
                    onPauseRequest={handlePause}
                    onRepublishRequest={handleRepublish}
                    onSoldRequest={handleSold}
                    onDeleteRequest={setVehicleToDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setVehicleToDelete(null)}
        >
          <div 
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Excluir veículo</h3>
            <p className="text-[var(--muted)] mb-6 leading-relaxed">
              Tem certeza que deseja excluir o veículo <strong className="text-[var(--foreground)]">{vehicleToDelete.brand} {vehicleToDelete.model}</strong>? Esta ação removerá o veículo permanentemente do seu inventário.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setVehicleToDelete(null)}
                className="px-5 py-2.5 font-medium rounded-xl text-[var(--foreground)] bg-[var(--surface-hover)] hover:bg-[var(--border)] transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 font-medium rounded-xl text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Sim, excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
