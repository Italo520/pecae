import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForgeTheme } from '../../src/theme';

export default function BuyerLayout() {
  const { colors, typography } = useForgeTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#050505',
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.primary,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ padding: 8, marginLeft: -8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="perfil" 
        options={{ 
          title: 'Meu Perfil',
          headerShown: false // We will likely build a custom header for the main profile screen
        }} 
      />
      <Stack.Screen 
        name="perfil-editar" 
        options={{ 
          title: 'Editar Perfil',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="configuracoes" 
        options={{ 
          title: 'Configurações' 
        }} 
      />
    </Stack>
  );
}
