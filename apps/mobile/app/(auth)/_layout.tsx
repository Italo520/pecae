import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerBackTitle: 'Voltar',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="register"
        options={{
          headerTitle: 'Criar Conta',
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          headerTitle: 'Verificar E-mail',
        }}
      />
    </Stack>
  );
}
