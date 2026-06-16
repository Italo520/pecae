import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../store/auth-store';
import { Alert } from 'react-native';

export function useAuthGuard() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

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
      Alert.alert(
        'Acesso Restrito',
        options?.message || 'Você precisa estar logado para realizar esta ação.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Fazer Login', 
            onPress: () => router.push({ 
              pathname: '/(auth)/login', 
              params: { returnUrl: pathname } 
            }) 
          },
        ]
      );
      return;
    }

    if (options?.allowedRoles && user) {
      const userRole = user.type || 'BUYER';
      if (!options.allowedRoles.includes(userRole)) {
        Alert.alert(
          'Acesso Negado',
          'Você não tem permissão para realizar esta ação.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    }

    action();
  };

  return { requireAuth, isAuthenticated, user, isLoading };
}
