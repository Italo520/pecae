import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  lido?: boolean;
}

export function useChatMessages(roomId: string) {
  const queryClient = useQueryClient();

  const getMessages = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      return (response.data.items || []).reverse() as Message[];
    },
    enabled: !!roomId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ uri, roomId }: { uri: string; roomId: string }) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.post(`/chat/rooms/${roomId}/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data as { url: string };
    }
  });

  const addMessageToCache = (newMessage: Message) => {
    queryClient.setQueryData(['chatMessages', roomId], (oldData: Message[] | undefined) => {
      if (!oldData) return [newMessage];
      if (oldData.some((m) => m.id === newMessage.id)) return oldData;
      return [...oldData, newMessage];
    });
  };

  const setInitialMessages = (messages: Message[]) => {
    queryClient.setQueryData(['chatMessages', roomId], messages);
  };

  return {
    getMessages,
    uploadAttachment,
    addMessageToCache,
    setInitialMessages,
  };
}
