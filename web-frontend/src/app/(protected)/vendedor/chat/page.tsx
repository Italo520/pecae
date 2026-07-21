import { MessageSquare } from 'lucide-react';

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-[var(--muted)]" />
      </div>
      <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Mensagens</h2>
      <p className="text-[var(--muted)] max-w-sm">
        Selecione uma conversa na lateral esquerda para negociar peças e fechar vendas no modelo sob consulta.
      </p>
    </div>
  );
}
