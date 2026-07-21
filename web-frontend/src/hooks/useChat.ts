import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { 
  SalaChat, 
  CursorMensagens, 
  CriarSalaRequisicao 
} from '@pecae/shared';

export function useChats() {
  return useQuery<SalaChat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get('/chat/rooms');
      return response.data;
    },
    refetchInterval: 5000,
  });
}

export function useChatMessages(salaId: string) {
  return useQuery<CursorMensagens>({
    queryKey: ['chat-messages', salaId],
    queryFn: async () => {
      const response = await api.get(`/chat/rooms/${salaId}/messages`);
      return response.data;
    },
    enabled: !!salaId,
    refetchInterval: 3000,
  });
}

export function useChatRoom(salaId: string) {
  return useQuery<SalaChat>({
    queryKey: ['chat-room', salaId],
    queryFn: async () => {
      const response = await api.get(`/chat/rooms/${salaId}`);
      return response.data;
    },
    enabled: !!salaId,
  });
}

export function useCreateChatRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CriarSalaRequisicao) => {
      const response = await api.post('/chat/rooms', data);
      return response.data as SalaChat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salaId: string) => {
      const response = await api.put(`/chat/rooms/${salaId}/read`);
      return response.data;
    },
    onMutate: async (salaId) => {
      queryClient.setQueryData(['chats'], (old: SalaChat[] | undefined) => {
        if (!old) return old;
        return old.map(chat => chat.id === salaId ? { ...chat, naoLidos: 0 } : chat);
      });
    },
    onSuccess: (_, salaId) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chat-room', salaId] });
    },
  });
}
