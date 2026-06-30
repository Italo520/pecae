'use client';

import { Search, ArrowLeft, MoreVertical, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useChats } from '@/hooks/useChat';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  
  const { data: chats, isLoading, isError } = useChats();

  const filteredChats = chats?.filter(c => 
    c.interlocutor.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.tituloDaConversa.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/vendedor/dashboard" 
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-display font-semibold text-white">Inbox</h2>
          <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Buscar mensagens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[var(--color-primary)] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        
        {isError && (
          <div className="p-4 text-center text-red-400 text-sm">
            Erro ao carregar conversas.
          </div>
        )}

        {!isLoading && !isError && filteredChats.length === 0 && (
          <div className="p-4 text-center text-white/40 text-sm">
            Nenhuma conversa encontrada.
          </div>
        )}

        {filteredChats.map(chat => {
          const isActive = pathname === `/vendedor/chat/${chat.id}`;
          const lastMsg = chat.ultimaMensagem?.conteudo || 'Nova conversa iniciada';
          const timeStr = formatTime(chat.ultimaMensagem?.criadaEm || chat.atualizadaEm);
          
          return (
            <Link 
              key={chat.id}
              href={`/vendedor/chat/${chat.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative flex-shrink-0">
                {chat.interlocutor.avatar ? (
                  <img src={chat.interlocutor.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-medium text-lg shadow-inner">
                    {chat.interlocutor.nome.charAt(0)}
                  </div>
                )}
                {/* Online indicator mock for now */}
                {chat.naoLidos > 0 && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-primary)] border-2 border-black rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-sm font-semibold text-white truncate pr-2">{chat.interlocutor.nome}</h3>
                  <span className={`text-xs flex-shrink-0 ${chat.naoLidos > 0 ? 'text-[var(--color-primary)] font-medium' : 'text-white/40'}`}>
                    {timeStr}
                  </span>
                </div>
                <p className="text-xs text-white/60 truncate mb-1">
                  Interesse: <span className="text-white/80">{chat.tituloDaConversa}</span>
                </p>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-2 ${chat.naoLidos > 0 ? 'text-white font-medium' : 'text-white/50'}`}>
                    {lastMsg}
                  </p>
                  {chat.naoLidos > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(20,241,149,0.3)]">
                      {chat.naoLidos}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
