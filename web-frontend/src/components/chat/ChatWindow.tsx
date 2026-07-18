'use client';

import { 
  MoreVertical, 
  Paperclip, 
  Send, 
  Loader2,
  Check,
  CheckCheck
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useChatMessages, useChatRoom } from '@/hooks/useChat';
import { useStomp } from '@/hooks/useStomp';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/axios';
import { format } from 'date-fns';
import type { MensagemChat } from '@pecae/shared';

export default function ChatWindow({ chatId }: { chatId: string }) {
  const { user } = useAuthStore();
  const { data: history, isLoading } = useChatMessages(chatId);
  const { data: room } = useChatRoom(chatId);
  const { connected, subscribe, publish } = useStomp();
  
  const [messages, setMessages] = useState<MensagemChat[]>([]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync historical messages when loaded
  useEffect(() => {
    if (history?.itens) {
      const sorted = [...history.itens].sort((a, b) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
      setMessages(sorted);
    }
  }, [history]);

  // STOMP Connection for real-time
  useEffect(() => {
    if (!connected) return;

    publish(`/app/chat.join/${chatId}`, {});

    // Listen for new messages
    const topicSub = subscribe(`/topic/room/${chatId}`, (msg) => {
      // Broadcast messages will be automatically captured
    });

    const queueSub = subscribe(`/user/queue/historico`, (msg) => {
      if (msg.itens) {
        const sorted = [...msg.itens].sort((a: any, b: any) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
        setMessages(sorted);
      } else if (msg.id) {
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

  // Bloqueio de 6 horas se o anúncio correspondente for VENDIDO ou ENCERRADO
  const isBlocked = (() => {
    if (!room?.anuncioStatus || !room?.anuncioVendidoEm) return false;
    if (room.anuncioStatus !== 'VENDIDO' && room.anuncioStatus !== 'ENCERRADO') return false;
    const soldTime = new Date(room.anuncioVendidoEm).getTime();
    const now = Date.now();
    const diffHours = (now - soldTime) / (1000 * 60 * 60);
    return diffHours > 6;
  })();

  const handleSend = () => {
    if (!input.trim() || isBlocked) return;
    
    // Optimistic UI update
    const tempMsg: MensagemChat = {
      id: crypto.randomUUID(),
      salaId: chatId,
      remetenteId: user?.id || '',
      conteudo: input,
      criadaEm: new Date().toISOString(),
      lido: false
    };
    
    setMessages(prev => [...prev, tempMsg]);
    publish(`/app/chat.send/${chatId}`, { conteudo: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBlocked) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsUploading(true);
      const response = await api.post(`/chat/rooms/${chatId}/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { url } = response.data;
      
      const tempMsg: MensagemChat = {
        id: crypto.randomUUID(),
        salaId: chatId,
        remetenteId: user?.id || '',
        conteudo: `[IMAGE]:${url}`,
        criadaEm: new Date().toISOString(),
        lido: false
      };
      
      setMessages(prev => [...prev, tempMsg]);
      publish(`/app/chat.send/${chatId}`, { conteudo: `[IMAGE]:${url}` });
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'HH:mm');
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] relative">
      {/* Header */}
      <div className="h-[72px] px-6 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            {room?.interlocutor.avatar ? (
              <img src={room.interlocutor.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] font-medium shadow-sm">
                {room?.interlocutor.nome.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-[var(--foreground)] font-medium text-sm leading-none mb-1">
              {room?.interlocutor.nome || 'Carregando...'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              {room?.tituloDaConversa && (
                <span className="truncate max-w-[200px] md:max-w-[300px]">
                  Interesse: {room.tituloDaConversa}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {room?.miniaturaDaConversa && (
            <img src={room.miniaturaDaConversa} alt="Miniatura Veículo" className="w-10 h-10 rounded-xl object-cover border border-[var(--border)] hidden sm:block" />
          )}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)] transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand)]" />
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.remetenteId === user?.id;
          const isImage = msg.conteudo.startsWith('[IMAGE]:');
          const imageUrl = isImage ? msg.conteudo.replace('[IMAGE]:', '') : '';

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] md:max-w-[60%] ${
                isImage 
                  ? '' 
                  : `px-4 py-2.5 rounded-2xl ${
                      isMine 
                        ? 'bg-[var(--brand)] text-black rounded-tr-sm shadow-[0_0_15px_rgba(20,241,149,0.15)]' 
                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm'
                    }`
              }`}>
                {isImage ? (
                  <img 
                    src={imageUrl} 
                    alt="Imagem enviada" 
                    className="rounded-2xl max-w-full max-h-60 object-cover border border-[var(--border)] shadow-sm hover:scale-[1.02] transition-transform cursor-zoom-in"
                    onClick={() => window.open(imageUrl, '_blank')}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-[var(--muted)]">{formatTime(msg.criadaEm)}</span>
                {isMine && (
                  msg.lido ? (
                    <CheckCheck className="w-3.5 h-3.5 text-[var(--brand)]" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex-shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isBlocked && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-2.5 rounded-xl text-center font-medium mb-3">
            Conversa encerrada. O anúncio foi finalizado há mais de 6 horas.
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-2 focus-within:border-[var(--brand)]/50 focus-within:ring-1 focus-within:ring-[var(--brand)]/50 transition-all">
          <button 
            disabled={isBlocked || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-xl hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--brand)]" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBlocked}
            placeholder={isBlocked ? "Chat bloqueado..." : "Digite uma mensagem..."}
            className="flex-1 max-h-32 min-h-[44px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none py-3 outline-none text-sm custom-scrollbar disabled:cursor-not-allowed"
            rows={1}
            style={{ height: 'auto' }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || !connected || isBlocked}
            className="p-3 bg-[var(--brand)] text-black rounded-xl hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,241,149,0.2)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
