import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export interface NotificationItem {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'SYSTEM' | 'MESSAGE' | 'VEHICLE_MATCH' | 'PROMOTION' | string;
  urlAcao?: string;
  lida: boolean;
  criadaEm: string;
}

export interface SpringPage<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const getNotifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<SpringPage<NotificationItem>>('/notificacoes', {
        params: { size: 50, sort: 'criadaEm,desc' },
      });
      return data;
    },
    enabled: !!accessToken,
  });

  const getUnreadCount = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<SpringPage<NotificationItem>>('/notificacoes', {
        params: { size: 100 },
      });
      const unread = data.content.filter((n) => !n.lida).length;
      return unread;
    },
    refetchInterval: 30000, // Poll every 30s
    enabled: !!accessToken,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notificacoes/${id}/lida`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.put('/notificacoes/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
