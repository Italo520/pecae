import { Redirect } from 'expo-router';

export default function Index() {
  // Por enquanto, redireciona para o cadastro
  return <Redirect href="/(auth)/register" />;
}
