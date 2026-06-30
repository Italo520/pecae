'use client';

import { MessageSquare } from 'lucide-react';

export default function NegociacoesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Suas Negociações</h2>
      <p className="text-sm text-white/50 max-w-sm">
        Selecione uma conversa na lateral para continuar negociando com os desmanches.
      </p>
    </div>
  );
}
