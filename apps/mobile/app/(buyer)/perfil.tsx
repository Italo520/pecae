import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../src/theme';
import { useBuyerProfile } from '../../src/hooks/useBuyer';
import { useAuthStore } from '../../src/store/auth-store';
import { useUIStore } from '../../src/store/ui-store';

export default function PerfilCompradorMenu() {
  const { colors, typography, spacing, effects } = usePecaeTheme();
  const router = useRouter();
  const { data: profile, isLoading, error } = useBuyerProfile();
  const { clearAuth, user } = useAuthStore();
  const { themeMode, setThemeMode } = useUIStore();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  const toggleTheme = async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newTheme);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger, fontFamily: typography.primary }]}>
          Erro ao carregar perfil.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        
        {/* Top Header - Perfil do Usuário */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={[styles.avatar, { borderColor: colors.brand }]} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person" size={40} color={colors.textMuted} />
              </View>
            )}
            <TouchableOpacity 
              style={[styles.editAvatarBtn, { backgroundColor: colors.brand }]}
              onPress={() => router.push('/(buyer)/perfil-editar')}
            >
              <Ionicons name="pencil" size={14} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.textPrimary, fontFamily: typography.display }]}>
              {profile.name || 'Comprador PECAÊ'}
            </Text>
            <Text style={[styles.email, { color: colors.textMuted, fontFamily: typography.body }]}>
              {profile.email}
            </Text>
            <TouchableOpacity 
              style={[styles.editProfileLink, { borderColor: colors.border }]}
              onPress={() => router.push('/(buyer)/perfil-editar')}
            >
              <Text style={[styles.editProfileText, { color: colors.brand, fontFamily: typography.medium }]}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modo Escuro / Claro Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelGroup}>
              <Ionicons 
                name={themeMode === 'dark' ? 'moon' : 'sunny'} 
                size={22} 
                color={colors.brand} 
              />
              <Text style={[styles.toggleLabel, { color: colors.textPrimary, fontFamily: typography.medium }]}>
                Modo Escuro
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.brand }}
              thumbColor={themeMode === 'dark' ? '#000000' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Grupo: Favoritos e Interesses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
            FAVORITOS & BUSCAS
          </Text>
          
          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(buyer)/favoritos')}
          >
            <Ionicons name="heart-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Anúncios Salvos (Favoritos)
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => router.push('/(buyer)/buscas-salvas')}
          >
            <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Buscas Salvas
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Grupo: Minhas Compras */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
            COMPRAS
          </Text>
          
          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(buyer)/compras')}
          >
            <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Minhas Compras
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Grupo: Conta & Segurança */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
            CONTA & SEGURANÇA
          </Text>
          
          {(user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.type === 'MODERATOR' || user?.type === 'ADMIN') && (
            <TouchableOpacity 
              style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
              onPress={() => router.push('/(moderator)')}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.brand} />
              <Text style={[styles.rowText, { color: colors.brand, fontFamily: typography.medium }]}>
                Painel de Moderação
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.brand} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(buyer)/perfil-editar')}
          >
            <Ionicons name="person-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Minha Conta
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => router.push('/(buyer)/seguranca')}
          >
            <Ionicons name="lock-closed-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Central de Segurança
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Grupo: Suporte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
            SUPORTE
          </Text>
          
          <TouchableOpacity 
            style={[styles.rowButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(buyer)/ajuda')}
          >
            <Ionicons name="help-circle-outline" size={22} color={colors.textPrimary} />
            <Text style={[styles.rowText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Menu Ajuda
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: colors.danger }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger, fontFamily: typography.medium }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#050505',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 10,
  },
  editProfileLink: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  toggleContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 15,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    paddingLeft: 4,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
