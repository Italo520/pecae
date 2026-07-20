import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../store/auth-store';
import { useToast } from '../context/ToastContext';

export function useAuthGuard() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const requireAuth = (
    action: () => void,
    options?: {
      message?: string;
      allowedRoles?: string[];
      redirectTo?: string;
    }
  ) => {
    if (isLoading) return;

    if (!isAuthenticated) {
      showToast({
        type: 'auth',
        title: 'Acesso Restrito',
        message: options?.message || 'Você precisa estar logado para realizar esta ação.',
        duration: 0,
        actions: [
          {
            label: 'Cancelar',
            onPress: () => {},
          },
          {
            label: 'Fazer Login',
            primary: true,
            onPress: () =>
              router.push({
                pathname: '/(auth)/login',
                params: { returnUrl: pathname },
              }),
          },
        ],
      });
      return;
    }

    if (options?.allowedRoles && user) {
      const userRole = user.type || 'BUYER';
      if (!options.allowedRoles.includes(userRole)) {
        showToast({
          type: 'error',
          title: 'Acesso Negado',
          message: 'Você não tem permissão para realizar esta ação.',
          duration: 4000,
        });
        return;
      }
    }

    action();
  };

  return { requireAuth, isAuthenticated, user, isLoading };
}
