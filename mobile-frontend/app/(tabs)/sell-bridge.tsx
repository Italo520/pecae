import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../src/theme';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';
import { useToast } from '../../src/context/ToastContext';

export default function SellBridgeScreen() {
  const router = useRouter();
  const { colors } = usePecaeTheme();
  const { requireAuth, user, isLoading } = useAuthGuard();
  const { showToast } = useToast();

  useEffect(() => {
    if (isLoading) return;

    // Usuário não autenticado: requireAuth exibe o toast de login
    if (!user) {
      requireAuth(() => {
        router.replace('/(seller)/cadastrar-sucata');
      }, { allowedRoles: ['SELLER', 'BOTH'] });
      return;
    }

    const userRole = user.type || 'BUYER';
    const isSeller = userRole === 'SELLER' || userRole === 'BOTH';

    if (!isSeller) {
      showToast({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Apenas vendedores podem anunciar peças e cadastrar sucatas.',
        duration: 5000,
      });
      router.replace('/(tabs)/');
      return;
    }

    router.replace('/(seller)/cadastrar-sucata');
  }, [isLoading, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}
