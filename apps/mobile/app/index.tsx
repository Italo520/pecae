import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.type === 'SELLER' || user?.type === 'BOTH') {
      return <Redirect href="/(seller)/(tabs)" />;
    }
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
