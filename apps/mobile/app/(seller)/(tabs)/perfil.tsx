import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ForgeBackground, ForgeGlassCard, StatWidget, ForgeButton } from '../../../src/components/ForgeUI';
import { useForgeTheme } from '../../../src/theme';
import { api } from '../../../src/services/api';
import { Image } from 'react-native';
import { useAuthStore } from '../../../src/store/auth-store';

export default function SellerProfileScreen() {
  const { colors, effects } = useForgeTheme();
  const ForgeTokens = require('../../../src/theme/forge-tokens').ForgeTokens;
  const user = useAuthStore((state) => state.user);

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller-me'],
    queryFn: async () => {
      const response = await api.get('/sellers/me');
      return response.data;
    },
  });

  const handleVerificationRequest = () => {
    router.push('/(seller)/solicitar-verificacao');
  };

  const menuItems = [
    { icon: 'create-outline', label: 'Editar Perfil', action: () => router.push('/(seller)/perfil-editar') },
    { icon: 'shield-checkmark-outline', label: 'Segurança', action: () => {} },
    { icon: 'notifications-outline', label: 'Notificações', action: () => {} },
    { icon: 'help-buoy-outline', label: 'Suporte Técnico', action: () => {} },
    { icon: 'settings-outline', label: 'Configurações', action: () => {} },
  ];

  const quickActions = [
    { icon: 'add-circle', label: 'Novo Anúncio', color: colors.brand },
    { icon: 'wallet', label: 'Financeiro', color: colors.vibrant },
    { icon: 'chatbubbles', label: 'Mensagens', color: '#7ae6ff' },
  ];

  return (
    <ForgeBackground>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.push('/(seller)/perfil-editar')}
            style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {seller?.logo ? (
              <Image source={{ uri: seller.logo }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.brand, fontFamily: ForgeTokens.typography.display }]}>
                {seller?.storeName?.charAt(0) || user?.name?.charAt(0) || 'V'}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.nameContainer}>
              <Text style={[styles.storeName, { color: colors.textPrimary, fontFamily: ForgeTokens.typography.heading }]}>
                {seller?.storeName || 'Loja sem nome'}
              </Text>
              {seller?.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.brand} style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={[styles.userName, { color: colors.textMuted, fontFamily: ForgeTokens.typography.body }]}>
              {user?.name || user?.email}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <ForgeGlassCard style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <StatWidget 
              icon="layers-outline" 
              value={seller?.stats?.activeListings || 0} 
              label="Ativos" 
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatWidget 
              icon="cash-outline" 
              value={seller?.stats?.totalSold || 0} 
              label="Vendidos" 
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <StatWidget 
              icon="timer-outline" 
              value={seller?.stats?.avgResponseTimeMinutes ? `${seller.stats.avgResponseTimeMinutes}m` : '--'} 
              label="Resposta" 
            />
          </View>
        </ForgeGlassCard>

        {/* Verification Banner */}
        {!seller?.isVerified && (
          <TouchableOpacity onPress={handleVerificationRequest}>
            <ForgeGlassCard style={styles.verificationBanner} intensity={40}>
              <View style={styles.bannerContent}>
                <View style={[styles.bannerIcon, { backgroundColor: colors.brand }]}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.dark} />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={[styles.bannerTitle, { color: colors.textPrimary, fontFamily: ForgeTokens.typography.heading }]}>
                    Solicitar Verificação
                  </Text>
                  <Text style={[styles.bannerSub, { color: colors.textMuted, fontFamily: ForgeTokens.typography.body }]}>
                    Aumente sua credibilidade e vendas
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.brand} />
              </View>
            </ForgeGlassCard>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickActionItem}>
              <ForgeGlassCard style={styles.quickActionCard}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
                <Text style={[styles.quickActionLabel, { color: colors.textPrimary, fontFamily: ForgeTokens.typography.medium }]}>
                  {action.label}
                </Text>
              </ForgeGlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Section */}
        <ForgeGlassCard style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color={colors.brand} />
                <Text style={[styles.menuItemLabel, { color: colors.textPrimary, fontFamily: ForgeTokens.typography.medium }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </ForgeGlassCard>

        <ForgeButton 
          title="Sair da Conta" 
          variant="outline" 
          onPress={() => useAuthStore.getState().clearAuth()}
          style={styles.logoutButton}
        />
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </ForgeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 28,
  },
  headerInfo: {
    marginLeft: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 20,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  userName: {
    fontSize: 14,
    marginTop: 2,
  },
  statsCard: {
    marginBottom: 20,
    padding: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    width: 1,
    height: '60%',
    opacity: 0.3,
  },
  verificationBanner: {
    marginBottom: 20,
    borderColor: 'rgba(63, 255, 139, 0.3)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  bannerTitle: {
    fontSize: 16,
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionItem: {
    width: '31%',
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 12,
    height: 100,
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 9,
    marginTop: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  menuCard: {
    padding: 0,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
});
