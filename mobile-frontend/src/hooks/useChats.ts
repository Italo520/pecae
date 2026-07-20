import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface RoomDetails {
  id: string;
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  sellerId: string;
  interlocutor: {
    id: string;
    name: string | null;
    avatar: string | null;
    isVerified?: boolean;
  };
  anuncioStatus?: string | null;
  anuncioVendidoEm?: string | null;
}

export function useChats(roomId: string) {
  const queryClient = useQueryClient();

  const getRoomDetails = useQuery({
    queryKey: ['chatRoom', roomId],
    queryFn: async () => {
      const response = await api.get<RoomDetails>(`/chat/rooms/${roomId}`);
      return response.data;
    },
    enabled: !!roomId,
  });

  const markAsRead = useMutation({
    mutationFn: async () => {
      await api.put(`/chat/rooms/${roomId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });

  return {
    getRoomDetails,
    markAsRead,
  };
}
