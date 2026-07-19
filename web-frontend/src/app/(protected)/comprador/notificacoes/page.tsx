'use client';

import { useNotifications, NotificationItem } from '@/hooks/useNotifications';
import { Bell, Info, MessageSquare, Car, Tag, Check, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NotificacoesPage() {
  const router = useRouter();
  const { getNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { data: notificationsPage, isLoading } = getNotifications;

  const notifications = notificationsPage?.content || [];
  const hasUnread = notifications.some(n => !n.lida);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.lida) {
      try {
        await markAsRead.mutateAsync(notif.id);
      } catch (err) {
        console.error('Erro ao marcar como lida:', err);
      }
    }
    
    if (notif.urlAcao) {
      router.push(notif.urlAcao);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success('Todas as notificações foram marcadas como lidas.');
    } catch (err) {
      toast.error('Erro ao marcar notificações como lidas.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'VEHICLE_MATCH':
        return <Car className="w-5 h-5 text-[var(--brand)]" />;
      case 'PROMOTION':
        return <Tag className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-[var(--muted)]" />;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1) {
        return 'Ontem';
      }
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)] mr-2" />
        Carregando notificações...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center border border-[var(--brand)]/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
                Notificações
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Fique por dentro de atualizações do catálogo, mensagens e alertas.
              </p>
            </div>
          </div>

          {hasUnread && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)] shadow-sm">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-[var(--muted)] space-y-2">
              <Bell className="w-12 h-12 mx-auto stroke-1 opacity-50" />
              <p className="font-medium">Nenhuma notificação por aqui</p>
              <p className="text-xs">Avisaremos você quando novidades surgirem!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex items-start gap-4 hover:bg-[var(--surface-hover)] cursor-pointer transition-colors ${
                  !notif.lida ? 'bg-[var(--brand)]/5 border-l-2 border-l-[var(--brand)]' : ''
                }`}
              >
                {/* Icon wrapper */}
                <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] flex-shrink-0">
                  {getIcon(notif.tipo)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-semibold truncate ${
                      !notif.lida ? 'text-[var(--foreground)] font-bold' : 'text-[var(--foreground)]/80'
                    }`}>
                      {notif.titulo}
                    </h3>
                    <span className="text-[10px] text-[var(--muted)] font-mono flex-shrink-0 mt-0.5">
                      {formatTime(notif.criadaEm)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-2">
                    {notif.conteudo}
                  </p>

                  {notif.urlAcao && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--brand)] hover:underline font-semibold">
                      Ver detalhes
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.lida && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand)] shadow-[0_0_8px_rgba(20,241,149,0.5)] mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
