import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ title: 'Cadastro de Vendedor' }} />
      <Stack.Screen name="(tabs)" options={{ title: 'Painel do Vendedor' }} />
      <Stack.Screen name="perfil-editar" options={{ title: 'Editar Perfil', presentation: 'modal' }} />
    </Stack>
  );
}
