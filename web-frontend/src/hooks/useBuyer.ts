import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export interface BuyerProfile {
  id: string;
  avatar?: string;
  cpfCnpj?: string;
  birthDate?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  inApp: boolean;
}

export interface BuyerData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: string;
  buyerProfile: BuyerProfile | null;
  notificationPreferences: NotificationPreferences | null;
}

export const useBuyer = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const getBuyerProfile = useQuery({
    queryKey: ['buyer', 'me'],
    queryFn: async () => {
      const { data } = await api.get<BuyerData>('/buyers/me');
      return data;
    },
    enabled: !!token,
  });

  const updateBuyerProfile = useMutation({
    mutationFn: async (updateData: { name?: string; avatar?: string; phone?: string; cpfCnpj?: string }) => {
      const { data } = await api.put<BuyerData>('/buyers/me', updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['buyer', 'me'], data);
    },
  });

  const updateNotificationPreferences = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const { data } = await api.put('/buyers/me', { notificationPreferences: prefs });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'me'] });
    },
  });

  return {
    getBuyerProfile,
    updateBuyerProfile,
    updateNotificationPreferences,
  };
};
