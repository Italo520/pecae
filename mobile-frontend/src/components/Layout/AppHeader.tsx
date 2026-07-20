import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { usePecaeTheme } from '../../theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useAuthStore } from '../../store/auth-store';
import { ThemeToggle } from '../PecaeUI/ThemeToggle';

export function AppHeader() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();
  const { requireAuth } = useAuthGuard();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      clearAuth();
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.container}>
        <Pressable style={({ pressed }) => [styles.logoContainer, pressed && { opacity: 0.7 }]} onPress={() => router.push('/(tabs)/')}>
          <View style={[styles.logoIcon, { backgroundColor: colors.brand }]} />
          <Text style={[styles.logoText, { color: colors.textPrimary, fontFamily: typography.display }]}>PEÇAÊ</Text>
        </Pressable>

        <View style={styles.navContainer}>
          <Pressable onPress={() => router.push('/(tabs)/')} style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.textPrimary, fontFamily: typography.medium }]}>Início</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/search')} style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.textPrimary, fontFamily: typography.medium }]}>Buscar Veículos</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/favoritos')} style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.textPrimary, fontFamily: typography.medium }]}>Favoritos</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/mensagens')} style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.textPrimary, fontFamily: typography.medium }]}>Mensagens</Text>
          </Pressable>
        </View>

        <View style={styles.actionsContainer}>
          <ThemeToggle />
          {isAuthenticated ? (
            <Pressable onPress={() => router.push('/(buyer)/perfil')} style={styles.profileBtn}>
              <Ionicons name="person-circle-outline" size={24} color={colors.textPrimary} />
              <Text style={{ color: colors.textPrimary, marginLeft: 8 }}>{user?.name || 'Perfil'}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleAuthAction} style={({ pressed }) => [styles.loginBtn, { borderColor: colors.brand }, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.loginText, { color: colors.brand, fontFamily: typography.medium }]}>ENTRAR</Text>
            </Pressable>
          )}
          <Pressable onPress={() => requireAuth(() => router.push('/(seller)/'))} style={[styles.sellBtn, { backgroundColor: colors.brand }]}>
            <Text style={[styles.sellText, { color: '#000', fontFamily: typography.medium }]}>ANUNCIAR PEÇAS</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    borderBottomWidth: 1,
    justifyContent: 'center',

  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    transform: [{ rotate: '15deg' }],
  },
  logoText: {
    fontSize: 20,
    letterSpacing: 1,
  },
  navContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  navItem: {
    paddingVertical: 8,
  },
  navText: {
    fontSize: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  loginText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  sellBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sellText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
