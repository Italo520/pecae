import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { PecaeBackground } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useInfiniteSearchVehicles } from '../../src/hooks/useVehicles';
import { useAuthStore } from '../../src/store/auth-store';
import { getVehicleImage } from '../../src/utils/vehicleImages';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VehicleSearchBar } from '../../src/components/Search/VehicleSearchBar';
import { BannerCarousel } from '../../src/components/Home/BannerCarousel';
import { AppFooter } from '../../src/components/Layout/AppFooter';
import { useDeviceLayout } from '../../src/hooks/useDeviceLayout';
import { FipeSearchForm } from '../../src/components/Search/FipeSearchForm';
import { VehicleCard } from '../../src/components/Vehicle/VehicleCard';
import { useToast } from '../../src/context/ToastContext';
import { useState } from 'react';

const CATEGORIES = [
  { id: '1', name: 'Carros', type: 'carro', icon: 'car-sport-outline' },
  { id: '2', name: 'Motos', type: 'moto', icon: 'bicycle-outline' },
  { id: '3', name: 'Caminhões', type: 'caminhao', icon: 'bus-outline' },
  { id: '4', name: 'Outros', type: 'outro', icon: 'construct-outline' },
];

// Componente sentinela para web: dispara quando entra no viewport
function WebScrollSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !ref.current) return;

    const observer = new (window as any).IntersectionObserver(
      (entries: any[]) => {
        if (entries[0]?.isIntersecting) {
          onVisible();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);

  return <View ref={ref} style={{ height: 1 }} />;
}

export default function BuyerHomeScreen() {
  const { colors, typography } = usePecaeTheme();
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { width, isDesktop, cardWidth } = useDeviceLayout();
  const router = useRouter();
  const { showToast } = useToast();
  const gridPadding = isDesktop ? 0 : 20;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSearchVehicles({
    type: activeCategory,
    limit: 20,
  });

  // Flatten todas as páginas em uma lista linear
  const listings = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleProfilePress = () => {
    showToast({
      type: 'info',
      title: 'Perfil',
      message: 'O que deseja fazer?',
      duration: 0,
      actions: [
        { label: 'Ver Perfil', onPress: () => router.push('/(buyer)/perfil') },
        {
          label: 'Sair da Conta',
          primary: true,
          onPress: async () => {
            await useAuthStore.getState().clearAuth();
            router.replace('/(auth)/login');
          },
        },
      ],
    });
  };

  // Helper para formatar dados do veículo
  const mapVehicle = (vehicle: any) => {
    const getSafeText = (val: any) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      return val.name || '';
    };
    const brand = getSafeText(vehicle.brand);
    const model = getSafeText(vehicle.model);
    const version = getSafeText(vehicle.version?.name || vehicle.version);
    const imageUrl =
      vehicle.thumbnail ||
      (vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos[0] : null) ||
      getVehicleImage(brand, model, vehicle.id);
    const yearFab = vehicle.yearFab || '--';
    const yearModel = vehicle.yearModel || yearFab;

    return { brand, model, version, imageUrl, yearFab, yearModel };
  };

  // Rodapé da lista (spinner de carregamento / fim)
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.brand}
          style={{ marginVertical: 24 }}
        />
      );
    }
    if (!hasNextPage && listings.length > 0) {
      return (
        <Text
          style={[
            styles.endText,
            { color: colors.textMuted, fontFamily: typography.regular },
          ]}
        >
          Você chegou ao fim 🎉
        </Text>
      );
    }
    return null;
  };

  // ----- HEADER + CONTEÚDO ESTÁTICO (Banner, FIPE, Categorias, Título) -----
  const renderHeader = () => (
    <>
      {/* Header Fixo - Mostrado no Mobile. No Desktop é substituído pelo AppHeader */}
      {!isDesktop && (
        <View
          style={[
            styles.header,
            { backgroundColor: colors.background, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: colors.brand }]} />
              <Text
                style={[
                  styles.logoText,
                  { color: colors.textPrimary, fontFamily: typography.display },
                ]}
              >
                PEÇAÊ
              </Text>
            </View>
            <VehicleSearchBar />
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/notificacoes')}
                style={styles.actionBtn}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/mensagens')}
                style={styles.actionBtn}
              >
                <View>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={22}
                    color={colors.textPrimary}
                  />
                  <View style={[styles.badge, { backgroundColor: colors.error }]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Conteúdo estático acima da grade */}
      <View style={isDesktop ? styles.innerDesktop : undefined}>
        <BannerCarousel />
        <FipeSearchForm />

        {/* Categorias */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoriesScroll,
              { paddingHorizontal: gridPadding },
            ]}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, activeCategory === cat.type && { opacity: 0.7 }]}
                onPress={() =>
                  setActiveCategory(activeCategory === cat.type ? undefined : cat.type)
                }
              >
                <View
                  style={[
                    styles.categoryCircle,
                    { backgroundColor: colors.surface, shadowColor: '#000' },
                    activeCategory === cat.type && {
                      borderColor: colors.brand,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={28}
                    color={activeCategory === cat.type ? colors.brand : colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    {
                      color:
                        activeCategory === cat.type ? colors.brand : colors.textPrimary,
                      fontFamily: typography.medium,
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Título da seção */}
        <View style={[styles.recommendationsHeader, { paddingHorizontal: gridPadding }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, fontFamily: typography.display },
            ]}
          >
            Recomendado para Você
          </Text>
        </View>
      </View>
    </>
  );

  // -----  RENDERIZAÇÃO DA GRADE DE CARDS -----
  const renderItem = useCallback(
    ({ item: vehicle }: { item: any }) => {
      const { brand, model, version, imageUrl, yearFab, yearModel } =
        mapVehicle(vehicle);
      return (
        <View
          style={[
            styles.cardWrapper,
            isDesktop ? { width: cardWidth as any } : styles.cardWrapperMobile,
          ]}
        >
          <VehicleCard
            id={vehicle.id}
            brand={brand}
            model={model}
            version={version}
            year={`${yearFab}/${yearModel}`}
            mileage={vehicle.mileage}
            fuel={vehicle.fuelType}
            city={vehicle.city || vehicle.seller?.city}
            state={vehicle.state || vehicle.seller?.state}
            imageUrl={imageUrl}
          />
        </View>
      );
    },
    [isDesktop, cardWidth]
  );

  // ===== DESKTOP (Web): ScrollView com sentinel de IntersectionObserver =====
  if (isDesktop) {
    return (
      <PecaeBackground>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.brand}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={[styles.innerDesktop, { paddingBottom: 80 }]}>
              <View style={styles.productGridDesktop}>
                {listings.map((vehicle: any) => {
                  const { brand, model, version, imageUrl, yearFab, yearModel } =
                    mapVehicle(vehicle);
                  return (
                    <View key={vehicle.id} style={{ width: cardWidth as any }}>
                      <VehicleCard
                        id={vehicle.id}
                        brand={brand}
                        model={model}
                        version={version}
                        year={`${yearFab}/${yearModel}`}
                        mileage={vehicle.mileage}
                        fuel={vehicle.fuelType}
                        city={vehicle.city || vehicle.seller?.city}
                        state={vehicle.state || vehicle.seller?.state}
                        imageUrl={imageUrl}
                        style={{ marginBottom: 24 }}
                      />
                    </View>
                  );
                })}
              </View>

              {/* Sentinel: quando aparecer no viewport, carrega mais */}
              {hasNextPage && (
                <WebScrollSentinel onVisible={handleLoadMore} />
              )}

              {renderFooter()}
              <AppFooter />
            </View>
          )}
        </ScrollView>
      </PecaeBackground>
    );
  }

  // ===== MOBILE: FlatList com infinite scroll automático no fim =====
  return (
    <PecaeBackground>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.brand}
              style={{ marginTop: 40 }}
            />
          ) : null
        }
        contentContainerStyle={styles.scrollContent}
        // Infinite scroll: carrega mais quando chegar a 30% do fim
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        // Evita bugs de imagens sumindo ao rolar de volta
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        // Espaçamento entre cards
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        style={styles.container}
      />
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  innerDesktop: {
    maxWidth: 1200,
    alignSelf: 'center' as any,
    width: '100%',
    paddingHorizontal: 32,
  },
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
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: 1,
  },
  productGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 0,
  },
  cardWrapperMobile: {
    paddingHorizontal: 20,
  },
  endText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 13,
  },
});
