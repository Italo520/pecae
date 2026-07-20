'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCreateChatRoom } from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';

interface ContactCTAProps {
  listingId: string;
  sellerId: string;
  whatsapp?: string;
  sellerName: string;
}

export function ContactCTA({ listingId, sellerId, whatsapp, sellerName }: ContactCTAProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { mutateAsync: createChat, isPending } = useCreateChatRoom();

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/veiculo/${listingId}`);
      return;
    }

    // Apenas compradores podem iniciar chats de compra neste fluxo.
    if (user?.type !== 'BUYER') {
      alert('Apenas contas de Comprador podem iniciar uma negociação.');
      return;
    }

    try {
      console.log('Initiating chat...', { sellerId, listingId });
      const room = await createChat({ vendedorId: sellerId, anuncioId: listingId });
      console.log('Chat created:', room);
      router.push(`/comprador/negociacoes/${room.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Ocorreu um erro ao iniciar o chat. Tente novamente.');
    }
  };

  return (
    <div className="w-full mt-6 space-y-3">
      <button
        onClick={handleContact}
        disabled={isPending}
        className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
        Iniciar Chat Seguro
      </button>

      {whatsapp && (
        <button
          onClick={() => {
            const message = encodeURIComponent(`Olá ${sellerName}, vi seu anúncio no PECAÊ e tenho interesse.`);
            window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
          }}
          className="w-full bg-surface border border-border hover:bg-border/50 text-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Contato via WhatsApp
        </button>
      )}
      <p className="text-xs text-center text-muted mt-2">
        A PECAÊ não cobra taxa sobre a venda.
      </p>
    </div>
  );
}
