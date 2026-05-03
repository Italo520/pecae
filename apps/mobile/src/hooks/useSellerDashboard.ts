import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useVehicles } from './useVehicles';

export interface SellerStats {
  activeVehicles: number;
  totalSales: number;
  activeChats: number;
  viewsLast7Days: string;
}

export interface RecentMessage {
  id: string;
  senderName: string;
  subject: string;
  lastText: string;
  time: string;
  avatar: string | null;
}

export function useSellerDashboard() {
  const { data: vehicles } = useVehicles();
  
  // Mocking stats for now as backend might not have specialized dashboard endpoints
  const statsQuery = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async (): Promise<SellerStats> => {
      // In a real app, we'd fetch this from /sellers/dashboard/stats
      return {
        activeVehicles: vehicles?.filter(v => v.status === 'ACTIVE').length || 0,
        totalSales: vehicles?.filter(v => v.status === 'SOLD').length || 12, // Mock fallback
        activeChats: 8, // Mock
        viewsLast7Days: '1.2k' // Mock
      };
    },
    enabled: !!vehicles
  });

  const recentMessagesQuery = useQuery({
    queryKey: ['seller-recent-messages'],
    queryFn: async (): Promise<RecentMessage[]> => {
      // Mocking recent messages for the dashboard preview
      return [
        {
          id: '1',
          senderName: 'João Silva',
          subject: 'Ford Ka 2019',
          lastText: 'Qual o menor valor que você faz?',
          time: '10:42',
          avatar: null
        },
        {
          id: '2',
          senderName: 'Maria Oliveira',
          subject: 'Peças Celta 2012',
          lastText: 'Ainda tem a porta esquerda?',
          time: 'Ontem',
          avatar: null
        },
        {
          id: '3',
          senderName: 'Auto Peças Central',
          subject: 'Lote Sucata VW',
          lastText: 'Podemos fechar o pacote por 2k?',
          time: 'Ontem',
          avatar: null
        }
      ];
    }
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    recentMessages: recentMessagesQuery.data,
    isLoadingMessages: recentMessagesQuery.isLoading,
    refresh: () => {
      statsQuery.refetch();
      recentMessagesQuery.refetch();
    }
  };
}
