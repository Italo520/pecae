'use client';

import { useState } from 'react';
import { useModerationListings, useApproveListing, ListingModeration } from '@/hooks/useModerationListings';
import { RejectModal } from './RejectModal';
import { Check, X, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export function ModerationListingsTable() {
  const { data: listings, isLoading, isError } = useModerationListings();
  const { mutateAsync: approveListing } = useApproveListing();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectIds, setRejectIds] = useState<string[]>([]);
  const [isApproving, setIsApproving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-white/50">
        Erro ao carregar anúncios. Tente novamente mais tarde.
      </div>
    );
  }

  const safeListings = listings || [];
  
  const filteredListings = safeListings.filter(l => 
    l.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.seller?.nomeFantasia?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredListings.map(l => l.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApproveBatch = async () => {
    if (!selectedIds.length) return;
    setIsApproving(true);
    try {
      await Promise.all(selectedIds.map(id => approveListing(id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to approve batch:', error);
      alert('Erro ao aprovar em lote.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectBatch = () => {
    if (!selectedIds.length) return;
    setRejectIds(selectedIds);
    setRejectModalOpen(true);
  };

  const handleApproveSingle = async (id: string) => {
    try {
      await approveListing(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (error) {
      console.error('Failed to approve single:', error);
      alert('Erro ao aprovar anúncio.');
    }
  };

  const handleRejectSingle = (id: string) => {
    setRejectIds([id]);
    setRejectModalOpen(true);
  };

  const handleRejectSuccess = () => {
    setRejectModalOpen(false);
    setSelectedIds([]);
    setRejectIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-white/20 sm:text-sm transition-colors"
            placeholder="Buscar por título ou vendedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[var(--color-primary)]/10 px-4 py-2 rounded-xl border border-[var(--color-primary)]/20 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-sm font-medium text-[var(--color-primary)]">
              {selectedIds.length} selecionados
            </span>
            <div className="w-px h-4 bg-[var(--color-primary)]/20 mx-1" />
            <button
              onClick={handleRejectBatch}
              disabled={isApproving}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Rejeitar
            </button>
            <button
              onClick={handleApproveBatch}
              disabled={isApproving}
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[#14F195] transition-colors flex items-center gap-1"
            >
              {isApproving && <Loader2 className="w-3 h-3 animate-spin" />}
              Aprovar
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-sm font-medium text-white/50">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/20 bg-black/50 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50"
                    checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="p-4">Anúncio</th>
                <th className="p-4 hidden md:table-cell">Vendedor</th>
                <th className="p-4 hidden sm:table-cell">Data</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">
                    Nenhum anúncio pendente encontrado.
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => {
                  const isSelected = selectedIds.includes(listing.id);
                  const imageUrl = listing.veiculo?.mainImage;

                  return (
                    <tr 
                      key={listing.id} 
                      className={`transition-colors hover:bg-white/[0.02] ${isSelected ? 'bg-[var(--color-primary)]/5' : ''}`}
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-white/20 bg-black/50 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50"
                          checked={isSelected}
                          onChange={() => toggleOne(listing.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={listing.titulo} fill className="object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-white/20" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm line-clamp-1">{listing.titulo}</p>
                            <p className="text-xs text-white/50 mt-0.5">{listing.veiculo?.brand} {listing.veiculo?.model} • {listing.veiculo?.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm text-white/80">{listing.seller?.nomeFantasia}</div>
                        <div className="text-xs text-white/40">{listing.seller?.email}</div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="text-sm text-white/80">
                          {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRejectSingle(listing.id)}
                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Rejeitar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveSingle(listing.id)}
                            className="p-2 rounded-lg text-white/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                            title="Aprovar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RejectModal 
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSuccess={handleRejectSuccess}
        ids={rejectIds}
      />
    </div>
  );
}
