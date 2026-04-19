import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ForgeBackground } from '@/src/components/ForgeUI/ForgeBackground';
import { ForgeGlassCard } from '@/src/components/ForgeUI/ForgeGlassCard';
import { ForgeButton } from '@/src/components/ForgeUI/ForgeButton';
import { StatWidget } from '@/src/components/ForgeUI/StatWidget';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/src/services/api';
import { BlurView } from 'expo-blur';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: seller, isLoading } = useQuery({
    queryKey: ['seller-public', id],
    queryFn: async () => {
      const response = await api.get(`/sellers/${id}`);
      return response.data;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ['seller-listings', id],
    queryFn: async () => {
      const response = await api.get(`/sellers/${id}/listings`);
      return response.data;
    },
    enabled: !!seller,
  });

  if (isLoading) {
    return (
      <ForgeBackground>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Sincronizando com a forja...</Text>
        </View>
      </ForgeBackground>
    );
  }

  const handleStartChat = () => {
    // router.push(`/chat/${id}`);
    alert('Funcionalidade de chat disponível em breve (M06)');
  };

  const handleWhatsApp = () => {
    if (seller?.whatsapp) {
      const phone = seller.whatsapp.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${phone}`);
    }
  };

  return (
    <ForgeBackground>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.blurIcon}>
              <Ionicons name="chevron-back" size={24} color="#F8FAFC" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Profile Card Section */}
        <View style={styles.profileSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoOuterRing}>
              {seller?.logo ? (
                <Image source={{ uri: seller.logo }} style={styles.logo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {seller?.storeName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {seller?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              </View>
            )}
          </View>
          
          <Text style={styles.storeName}>{seller?.storeName}</Text>
          
          <View style={styles.infoPills}>
            <View style={styles.pill}>
              <Ionicons name="location-sharp" size={14} color="#3B82F6" />
              <Text style={styles.pillText}>{seller?.city}, {seller?.state}</Text>
            </View>
            {seller?.type === 'PJ' && (
              <View style={[styles.pill, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                <Ionicons name="business" size={14} color="#10B981" />
                <Text style={[styles.pillText, { color: '#10B981' }]}>Loja Oficial</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatWidget 
            label="Estoque Ativo" 
            value={seller?.stats?.activeListings || 0} 
            icon="car-sport" 
          />
          <StatWidget 
            label="Tempo Resposta" 
            value={seller?.stats?.avgResponseTimeMinutes ? `${seller.stats.avgResponseTimeMinutes}m` : '--'} 
            icon="flash" 
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ForgeButton 
            title="Iniciar Chat Seguro" 
            onPress={handleStartChat}
            variant="primary"
          />
          {seller?.showWhatsapp && (
            <TouchableOpacity 
              onPress={handleWhatsApp}
              style={styles.whatsappButton}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
              <Text style={styles.whatsappButtonText}>WHATSAPP DA LOJA</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About Section */}
        {seller?.description && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Sobre o Vendedor</Text>
            <ForgeGlassCard style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{seller.description}</Text>
            </ForgeGlassCard>
          </View>
        )}

        {/* Listings Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Anúncios em Destaque</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {listings?.length > 0 ? (
            <View style={styles.listingsGrid}>
              {/* Maps listings here */}
            </View>
          ) : (
            <ForgeGlassCard style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="car-outline" size={48} color="rgba(148, 163, 184, 0.3)" />
              </View>
              <Text style={styles.emptyTitle}>Sem anúncios ativos</Text>
              <Text style={styles.emptySubtitle}>
                Este vendedor ainda não publicou anúncios ou está atualizando seu estoque.
              </Text>
            </ForgeGlassCard>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Contact Pill (Optional UI Polish) */}
    </ForgeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
  navHeader: {
    height: 100,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoOuterRing: {
    padding: 4,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: '#F8FAFC',
    fontSize: 48,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 2,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  storeName: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  infoPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 40,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  whatsappButtonText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionCard: {
    padding: 20,
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
