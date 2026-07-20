'use client';

import { 
  MoreVertical, 
  Paperclip, 
  Send, 
  Loader2,
  Check,
  CheckCheck,
  Flag
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useChatMessages, useChatRoom } from '@/hooks/useChat';
import { useStomp } from '@/hooks/useStomp';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/axios';
import { format } from 'date-fns';
import type { MensagemChat } from '@pecae/shared';
import { toast } from 'sonner';

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

  // States for report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('FRAUDE');
  const [reportDesc, setReportDesc] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
      const response = await api.post(`/chat/rooms/${chatId}/attachment`, formData);
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

  const handleSubmitReport = async () => {
    if (isSubmittingReport) return;
    setIsSubmittingReport(true);
    try {
      await api.post('/denuncias', {
        tipoAlvo: 'USUARIO',
        idAlvo: room?.interlocutor.id,
        categoria: reportCategory,
        descricao: reportDesc
      });
      toast.success('Denúncia submetida com sucesso. Agradecemos sua colaboração!');
      setIsReportModalOpen(false);
      setReportDesc('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmittingReport(false);
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
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Denunciar conversa"
            >
              <Flag className="w-3.5 h-3.5" />
              Denunciar
            </button>
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

        {!isBlocked && (
          <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar max-w-4xl mx-auto">
            {['Olá! A peça ainda está disponível?', 'Qual o menor valor que faz?', 'Consigo retirar hoje?', 'Está funcionando perfeitamente?', 'Tem garantia?'].map((qr, index) => (
              <button
                key={index}
                onClick={() => setInput(qr)}
                className="whitespace-nowrap px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--brand)] transition-all font-medium cursor-pointer"
              >
                {qr}
              </button>
            ))}
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

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="text-lg font-bold font-display text-[var(--foreground)]">Denunciar Usuário</h3>
              <p className="text-xs text-[var(--muted)] mt-1">Sua denúncia será avaliada de forma confidencial pela nossa moderação.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider block mb-2">Motivo da Denúncia</label>
                <select 
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50"
                >
                  <option value="FRAUDE">Suspeita de Fraude / Golpe</option>
                  <option value="SPAM">Spam / Divulgação indevida</option>
                  <option value="CONTEUDO_INADEQUADO">Conteúdo Ofensivo / Inadequado</option>
                  <option value="FALSO">Perfil ou Produto Falso</option>
                  <option value="OUTRO">Outros motivos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider block mb-2">Descrição detalhada</label>
                <textarea 
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Forneça mais detalhes sobre o comportamento deste usuário..."
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                disabled={isSubmittingReport}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Submeter Denúncia'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
