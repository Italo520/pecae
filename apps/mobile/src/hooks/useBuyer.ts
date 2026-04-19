import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface BuyerProfile {
  id: string;
  avatarUrl?: string;
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
  role: string;
  buyerProfile: BuyerProfile | null;
  notificationPreferences: NotificationPreferences | null;
}

export const useBuyerProfile = () => {
  return useQuery({
    queryKey: ['buyer', 'me'],
    queryFn: async () => {
      const { data } = await api.get<BuyerData>('/buyers/me');
      return data;
    },
  });
};

export const useUpdateBuyerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: { name?: string; avatarUrl?: string }) => {
      const { data } = await api.put<BuyerData>('/buyers/me', updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['buyer', 'me'], data);
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const { data } = await api.put('/buyers/me', { notificationPreferences: prefs });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'me'] });
    },
  });
};
