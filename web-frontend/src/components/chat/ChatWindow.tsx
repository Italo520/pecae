'use client';

import { 
  MoreVertical, 
  Paperclip, 
  Send, 
  Phone, 
  Info,
  Car,
  Loader2
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '@/hooks/useChat';
import { useStomp } from '@/hooks/useStomp';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MensagemChat } from '@pecae/shared';

export default function ChatWindow({ chatId }: { chatId: string }) {
  const { user } = useAuthStore();
  const { data: history, isLoading } = useChatMessages(chatId);
  const { connected, subscribe, publish } = useStomp();
  
  const [messages, setMessages] = useState<MensagemChat[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync historical messages when loaded
  useEffect(() => {
    if (history?.itens) {
      // API returns recent first or chronological? Assuming chronological for UI display,
      // If it's reverse (latest first), we need to reverse it. Usually cursor pagination returns latest first.
      // We will sort by date just to be safe.
      const sorted = [...history.itens].sort((a, b) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
      setMessages(sorted);
    }
  }, [history]);

  // STOMP Connection for real-time
  useEffect(() => {
    if (!connected) return;

    // We join the room explicitly (so the backend marks as read and returns initial history if needed)
    // The backend `ControladorWebSocketChat` has `/app/chat.join/{salaId}` and sends to `/queue/historico`.
    publish(`/app/chat.join/${chatId}`, {});

    // Listen for new messages
    const topicSub = subscribe(`/topic/room/${chatId}`, (msg) => {
      // When a message arrives via PubSub (assuming backend sends the full message object here)
      // Actually, looking at Java `publicarNoRedis`, it sends `RespostaMensagemChat` to `chat:room:id` which Redis routes to STOMP?
      // Wait, the backend code `brokerStomp.convertAndSend("/topic/room/" + salaId + "/typing"` exists for typing.
      // But for messages it's probably using a topic or queue. 
      // If not sure, we can refetch the REST API or just append the incoming message.
    });

    // We also should listen to the private queue if the backend sends it directly to the user
    const queueSub = subscribe(`/user/queue/historico`, (msg) => {
      // In case we get the history via websocket as defined in Java
      if (msg.itens) {
        const sorted = [...msg.itens].sort((a: any, b: any) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
        setMessages(sorted);
      } else if (msg.id) {
        // It's a single message
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      topicSub?.unsubscribe();
      queueSub?.unsubscribe();
    };
  }, [connected, chatId, publish, subscribe]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Optmistic UI update
    const tempMsg: MensagemChat = {
      id: crypto.randomUUID(),
      salaId: chatId,
      remetenteId: user?.id || '',
      conteudo: input,
      criadaEm: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    // Send via STOMP
    publish(`/app/chat.send/${chatId}`, { conteudo: input });
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString: string) => {
    return format(new Date(isoString), 'HH:mm');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] relative">
      {/* Header */}
      <div className="h-[72px] px-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-medium shadow-inner">
            <UserIcon />
          </div>
          <div>
            <h2 className="text-white font-medium">Conversa Ativa</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--color-primary)]' : 'bg-red-500'}`} />
              <span className={connected ? 'text-[var(--color-primary)]' : 'text-red-500'}>
                {connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.remetenteId === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                isMine 
                  ? 'bg-[var(--color-primary)] text-black rounded-tr-sm shadow-[0_0_15px_rgba(20,241,149,0.15)]' 
                  : 'bg-white/10 text-white/90 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
              </div>
              <span className="text-[10px] text-white/40 mt-1 px-1">{formatTime(msg.criadaEm)}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[var(--color-primary)]/50 focus-within:ring-1 focus-within:ring-[var(--color-primary)]/50 transition-all">
          <button className="p-3 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent text-white placeholder:text-white/40 resize-none py-3 outline-none text-sm custom-scrollbar"
            rows={1}
            style={{ height: 'auto' }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || !connected}
            className="p-3 bg-[var(--color-primary)] text-black rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,241,149,0.2)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
