'use client';

import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NegociacoesPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <EmptyState 
        icon={<MessageSquare className="w-8 h-8" />}
        title="Suas Negociações"
        description="Selecione uma conversa na lateral para continuar negociando com os desmanches."
      />
    </div>
  );
}
