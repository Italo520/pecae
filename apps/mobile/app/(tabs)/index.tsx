import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, useWindowDimensions, TextInput, Animated, Platform } from 'react-native';
import { PecaeBackground, PecaeGlassCard, PecaeImage } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useSearchVehicles } from '../../src/hooks/useVehicles';
import { useAuthStore } from '../../src/store/auth-store';
import { getVehicleImage } from '../../src/utils/vehicleImages';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VehicleSearchBar } from '../../src/components/Search/VehicleSearchBar';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';
import { BannerCarousel } from '../../src/components/Home/BannerCarousel';
import { PageContainer } from '../../src/components/Layout/PageContainer';
import { AppFooter } from '../../src/components/Layout/AppFooter';
import { useDeviceLayout } from '../../src/hooks/useDeviceLayout';
import { FipeSearchForm } from '../../src/components/Search/FipeSearchForm';
import { VehicleCard } from '../../src/components/Vehicle/VehicleCard';
import { useToast } from '../../src/context/ToastContext';

const CATEGORIES = [
  { id: '1', name: 'Carros Sucata', icon: 'car-outline' },
  { id: '2', name: 'Motos Sucata', icon: 'bicycle-outline' },
  { id: '3', name: 'Caminhões', icon: 'bus-outline' },
  { id: '4', name: 'Maquinário', icon: 'construct-outline' },
  { id: '5', name: 'Leilões', icon: 'hammer-outline' },
];

export default function BuyerHomeScreen() {
  const { colors, typography, effects } = usePecaeTheme();
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data: searchResponse, isLoading } = useSearchVehicles({ 
    q: activeCategory
  });
  const { createSavedSearch } = useSavedSearches();
  const listings = searchResponse?.data || [];
  const { width, isDesktop } = useDeviceLayout();
  const router = useRouter();
  const { showToast } = useToast();



  const handleProfilePress = () => {
    showToast({
      type: 'info',
      title: 'Perfil',
      message: 'O que deseja fazer?',
      duration: 0,
      actions: [
        { label: 'Ver Perfil', onPress: () => router.push('/(buyer)/perfil') },
        { label: 'Sair da Conta', primary: true, onPress: async () => { await useAuthStore.getState().clearAuth(); router.replace('/(auth)/login'); } },
      ],
    });
  };



  const isWeb = width >= 768;
  const columns = isWeb ? 4 : 1;
  const gap = 12;
  const scrollbarWidth = isWeb ? 16 : 0;
  const screenWidth = width - scrollbarWidth;
  
  // No desktop (isDesktop = true, width >= 1024), o PageContainer limita o maxWidth a 1200 
  // e aplica um paddingHorizontal de 32 de cada lado (total de 64px). 
  // Portanto, a largura útil real do container é Math.min(screenWidth, 1200) - 64.
  const containerWidth = isDesktop ? Math.min(screenWidth, 1200) - 64 : screenWidth;
  const gridPadding = isDesktop ? 0 : 20;

  // Arredonda para baixo e adiciona uma folga maior (10px) para evitar quebras por scrollbar ou arredondamento de subpixel no navegador
  const itemWidth = Math.floor((containerWidth - (gridPadding * 2) - (gap * (columns - 1))) / columns) - 10;

  console.log("LAYOUT_DEBUG:", {
    width,
    isDesktop,
    isWeb,
    columns,
    containerWidth,
    gridPadding,
    itemWidth
  });

  return (
    <PecaeBackground>
      {/* Header Fixo - Mostrado no Mobile. No Desktop é substituído pelo AppHeader do _layout */}
      {!isDesktop && (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          {/* Logo Estilizado */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: colors.brand }]} />
            <Text style={[styles.logoText, { color: colors.textPrimary, fontFamily: typography.display }]}>PEÇAÊ</Text>
          </View>

          {/* Barra de Busca Redirecionável */}
          <VehicleSearchBar />

          {/* Ações Direitas */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notificacoes')} style={styles.actionBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/mensagens')} style={styles.actionBtn}>
              <View>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.textPrimary} />
                <View style={[styles.badge, { backgroundColor: colors.error }]} />
              </View>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      )}

      <PageContainer contentContainerStyle={styles.scrollContent}>
        
        {/* Banner Carousel */}
        <BannerCarousel />
        
        {/* FIPE Search Form */}
        <FipeSearchForm />
        
        {/* Carrossel de Categorias */}
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoriesScroll,
              { flexGrow: 1, justifyContent: 'center', paddingHorizontal: gridPadding }
            ]}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                  styles.categoryItem,
                  activeCategory === cat.name && { opacity: 0.7 }
                ]}
                onPress={() => {
                  if (activeCategory === cat.name) {
                    setActiveCategory(undefined);
                  } else {
                    setActiveCategory(cat.name);
                  }
                }}
              >
                <View style={[
                  styles.categoryCircle, 
                  { backgroundColor: colors.surface, shadowColor: '#000' },
                  activeCategory === cat.name && { borderColor: colors.brand, borderWidth: 2 }
                ]}>
                  <Ionicons name={cat.icon as any} size={28} color={activeCategory === cat.name ? colors.brand : colors.textMuted} />
                </View>
                <Text style={[
                  styles.categoryLabel, 
                  { color: activeCategory === cat.name ? colors.brand : colors.textPrimary, fontFamily: typography.medium }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Seção de Recomendações */}
        <View style={[styles.recommendationsHeader, { paddingHorizontal: gridPadding }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            Recomendado para Você
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.productGrid, { paddingHorizontal: gridPadding }]}>
            {listings.map((vehicle: any) => {
              const getSafeText = (val: any) => {
                if (!val) return '';
                if (typeof val === 'string') return val;
                return val.name || '';
              };
              
              const brand = getSafeText(vehicle.brand);
              const model = getSafeText(vehicle.model);
              const imageUrl = getVehicleImage(brand, model, vehicle.id);
              
              // Título composto: marca - modelo - (ano fabricação/anomodelo)
              const yearFab = vehicle.yearFab || '--';
              const yearModel = vehicle.yearModel || yearFab;
              const title = `${brand} - ${model} - (${yearFab}/${yearModel})`.trim() || 'Veículo sem título';
              
              return (
                <VehicleCard
                  key={vehicle.id}
                  id={vehicle.id}
                  title={title}
                  price={vehicle.price}
                  year={`${yearFab}/${yearModel}`}
                  mileage={vehicle.mileage}
                  fuel={vehicle.fuelType}
                  city={vehicle.city || vehicle.seller?.city}
                  state={vehicle.state || vehicle.seller?.state}
                  imageUrl={vehicle.photos?.[0]?.url || vehicle.thumbnail || imageUrl}
                  style={{ width: isWeb ? itemWidth : '100%', marginBottom: 24 }}
                />
              );
            })}
          </View>
        )}
        
        {isDesktop && <AppFooter />}
      </PageContainer>


    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    transform: [{ rotate: '15deg' }],
  },
  logoText: {
    fontSize: 16,
    letterSpacing: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
  },
  filterBtn: {
    padding: 6,
    borderRadius: 8,
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoriesSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 20,
    minWidth: '100%',
    justifyContent: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
    width: 70,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  recommendationsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: 1,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  productCardWrapper: {
    marginBottom: 12,
  },
  productCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 10,
    gap: 4,
  },
  productTitle: {
    fontSize: 12,
    lineHeight: 16,
    height: 32,
  },
  productPrice: {
    fontSize: 16,
    marginTop: 2,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productLocation: {
    fontSize: 8,
  },
  productTime: {
    fontSize: 8,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  fabText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});


