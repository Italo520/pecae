import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRejectListing } from '@/hooks/useModerationListings';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ids: string[];
}

export function RejectModal({ isOpen, onClose, onSuccess, ids }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: rejectListing } = useRejectListing();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('O motivo da rejeição é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        ids.map((id) => rejectListing({ id, reason }))
      );
      setReason('');
      onSuccess();
    } catch (error) {
      console.error('Error rejecting listings:', error);
      alert('Erro ao rejeitar anúncios. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-display font-semibold text-[var(--foreground)] mb-2">Rejeitar Anúncio(s)</h3>
        <p className="text-[var(--muted)] text-sm mb-6">
          Você está rejeitando {ids.length} anúncio(s). Informe o motivo detalhado para notificar o vendedor.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-[var(--foreground)] mb-2">Motivo da Rejeição *</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="Descreva por que o anúncio está sendo rejeitado (ex: fotos ilegíveis, dados inconsistentes...)"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:[var(--muted)] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl text-[var(--muted)] font-medium hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 inline-flex justify-center items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rejeitando...</span>
                </>
              ) : (
                <span>Confirmar Rejeição</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
