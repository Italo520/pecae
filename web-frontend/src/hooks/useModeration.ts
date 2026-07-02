import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useModerationVerifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'kyc'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/kyc/pending');
        return data;
      } catch (err) {
        return [];
      }
    }
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/kyc/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      toast.success('Documento aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Erro ao aprovar documento')
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason?: string }) => {
      const { data } = await api.post(`/admin/kyc/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      toast.success('Documento rejeitado.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Erro ao rejeitar documento')
  });

  return { ...query, approve, reject };
}

export function useModerationReports() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/reports');
        return data;
      } catch (err) {
        return [];
      }
    }
  });

  const resolve = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'BAN_USER' | 'REMOVE_AD' | 'DISMISS' }) => {
      const { data } = await api.post(`/admin/reports/${id}/resolve`, { action });
      return data;
    },
    onSuccess: () => {
      toast.success('Denúncia resolvida com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Erro ao resolver denúncia')
  });

  return { ...query, resolve };
}
