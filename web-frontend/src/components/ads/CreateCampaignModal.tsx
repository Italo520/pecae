'use client';

import { useState } from 'react';
import { useCreateCampaign, useCreateCreative, useUpdateCampaignStatus } from '@/hooks/useAds';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { mutateAsync: createCampaign, isPending: isCreatingCampaign } = useCreateCampaign();
  const { mutateAsync: createCreative, isPending: isCreatingCreative } = useCreateCreative();
  const { mutateAsync: updateStatus } = useUpdateCampaignStatus();

  const [formData, setFormData] = useState({
    nome: '',
    anuncianteId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    orcamentoTotal: '',
    urlImagem: '',
    urlDestino: '',
  });

  const isPending = isCreatingCampaign || isCreatingCreative;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campanha = await createCampaign({
        nome: formData.nome,
        anuncianteId: formData.anuncianteId,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        orcamentoTotal: parseFloat(formData.orcamentoTotal) || 0,
        notasInternas: 'Criado via Web Dashboard'
      });

      if (campanha?.id) {
        await createCreative({
          campanhaId: campanha.id,
          tituloAlt: formData.nome,
          urlImagem: formData.urlImagem || 'https://via.placeholder.com/1200x250?text=Ad',
          urlDestino: formData.urlDestino || '#',
          placement: 'HOME_TOP',
          textoCta: 'Saiba Mais',
          prioridade: 1
        });

        await updateStatus({ id: campanha.id, status: 'ATIVA' });
      }

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 text-[var(--foreground)]">
        <div className="mb-6">
          <h2 className="text-xl font-bold font-display text-[var(--brand)]">Nova Campanha Patrocinada</h2>
          <p className="text-[var(--muted)] text-sm mt-1">
            Crie a campanha e o banner (criativo) que aparecerá na Home do Comprador.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="nome" className="text-sm font-medium text-[var(--foreground)]">Nome da Campanha</label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="bg-[var(--surface)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="anuncianteId" className="text-sm font-medium text-[var(--foreground)]">ID do Anunciante (UUID)</label>
            <Input
              id="anuncianteId"
              value={formData.anuncianteId}
              onChange={(e) => setFormData({ ...formData, anuncianteId: e.target.value })}
              required
              className="bg-[var(--surface)] text-[var(--foreground)] font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="dataInicio" className="text-sm font-medium text-[var(--foreground)]">Data Início</label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
                className="bg-[var(--surface)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="dataFim" className="text-sm font-medium text-[var(--foreground)]">Data Fim</label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                required
                className="bg-[var(--surface)] text-[var(--foreground)]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="orcamentoTotal" className="text-sm font-medium text-[var(--foreground)]">Orçamento (R$)</label>
            <Input
              id="orcamentoTotal"
              type="number"
              step="0.01"
              value={formData.orcamentoTotal}
              onChange={(e) => setFormData({ ...formData, orcamentoTotal: e.target.value })}
              required
              className="bg-[var(--surface)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="urlImagem" className="text-sm font-medium text-[var(--foreground)]">URL da Imagem do Banner</label>
            <Input
              id="urlImagem"
              value={formData.urlImagem}
              onChange={(e) => setFormData({ ...formData, urlImagem: e.target.value })}
              placeholder="https://exemplo.com/banner.jpg"
              required
              className="bg-[var(--surface)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="urlDestino" className="text-sm font-medium text-[var(--foreground)]">Link de Destino</label>
            <Input
              id="urlDestino"
              value={formData.urlDestino}
              onChange={(e) => setFormData({ ...formData, urlDestino: e.target.value })}
              placeholder="https://pecae.com.br/promo-seguro"
              required
              className="bg-[var(--surface)] text-[var(--foreground)]"
            />
          </div>
          
          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              {isPending ? 'Lançando...' : 'Lançar Campanha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
