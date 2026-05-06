import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  useWindowDimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PecaeBackground, 
  PecaeGlassCard 
} from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useSearchVehicles } from '../../src/hooks/useVehicles';
import { getVehicleImage } from '../../src/utils/vehicleImages';
import { useRouter } from 'expo-router';

const QUICK_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'apps-outline' },
  { id: 'fiat', label: 'Fiat', icon: 'car-sport-outline' },
  { id: 'vw', label: 'VW', icon: 'car-sport-outline' },
  { id: 'chevrolet', label: 'GM', icon: 'car-sport-outline' },
  { id: 'sucata', label: 'Sucata', icon: 'hammer-outline' },
  { id: 'inteiro', label: 'Inteiro', icon: 'shield-checkmark-outline' },
];

export default function SearchScreen() {
  const { colors, typography } = usePecaeTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Integração com API
  const { data: searchResponse, isLoading } = useSearchVehicles({
    q: searchText,
    brandId: activeFilter !== 'all' ? activeFilter : undefined,
    city: city || undefined,
    state: state || undefined,
  });

  const results = searchResponse?.data || [];

  // Lógica de Grid Responsivo
  const isWeb = width >= 768;
  const columns = isWeb ? 4 : 2;
  const gap = 12;
  const horizontalPadding = 20;
  const itemWidth = (width - (horizontalPadding * 2) - (gap * (columns - 1))) / columns;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search-outline" size={48} color={colors.border} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
        {searchText ? 'NENHUM RESULTADO' : 'EXPLORE A FORJA'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
        {searchText 
          ? `Não encontramos nada para "${searchText}". Tente termos mais genéricos.`
          : 'Busque por peças, modelos ou marcas específicas no inventário.'}
      </Text>
    </View>
  );

  return (
    <PecaeBackground>
      {/* Search Header HUD */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}>
            <Ionicons name="search" size={20} color={colors.brand} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, fontFamily: typography.body }]}
              placeholder="O que você está procurando?"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterToggle, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={24} color={showFilters ? colors.brand : colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.advancedFilters}>
            <View style={styles.filterRow}>
              <View style={[styles.filterInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={{ color: colors.textPrimary, flex: 1, fontSize: 12 }}
                  placeholder="Cidade"
                  placeholderTextColor={colors.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={[styles.filterInput, { backgroundColor: colors.surface, borderColor: colors.border, width: 60 }]}>
                <TextInput
                  style={{ color: colors.textPrimary, flex: 1, fontSize: 12, textAlign: 'center' }}
                  placeholder="UF"
                  placeholderTextColor={colors.textMuted}
                  value={state}
                  onChangeText={(val) => setState(val.toUpperCase().substring(0, 2))}
                  maxLength={2}
                />
              </View>
              <TouchableOpacity onPress={() => { setCity(''); setState(''); }}>
                <Text style={{ color: colors.brand, fontSize: 12 }}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filtros Rápidos Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersScroll}
        >
          {QUICK_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: isSelected ? colors.brand : colors.surface,
                    borderColor: isSelected ? colors.brand : colors.border
                  }
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={isSelected ? '#000' : colors.textPrimary} 
                />
                <Text 
                  style={[
                    styles.filterLabel, 
                    { 
                      color: isSelected ? '#000' : colors.textPrimary,
                      fontFamily: typography.medium
                    }
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[styles.loaderText, { color: colors.textMuted, fontFamily: typography.body }]}>
              Vasculhando o estoque...
            </Text>
          </View>
        ) : results.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.resultsGrid}>
            {results.map((vehicle: any) => {
              const brand = vehicle.version?.model?.brand?.name || '';
              const model = vehicle.version?.model?.name || '';
              const imageUrl = vehicle.thumbnail || (vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos[0] : null);
              const title = vehicle.title || `${brand} ${model}`.trim();

              return (
                <TouchableOpacity 
                  key={vehicle.id} 
                  style={[styles.productCardWrapper, { width: itemWidth }]}
                  onPress={() => router.push(`/(tabs)/vehicle/${vehicle.id}`)}
                >
                  <PecaeGlassCard intensity={15} style={styles.productCard}>
                    <View style={styles.imageContainer}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.productImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="image-outline" size={32} color={colors.border} />
                        </View>
                      )}
                      <View style={[styles.badge, { backgroundColor: colors.brand }]}>
                        <Text style={styles.badgeText}>SUCATA</Text>
                      </View>
                    </View>
                    
                    <View style={styles.productInfo}>
                      <Text style={[styles.productTitle, { color: colors.textPrimary, fontFamily: typography.display }]} numberOfLines={2}>
                        {title}
                      </Text>
                      
                      <View style={styles.productFooter}>
                        <Ionicons name="location-outline" size={10} color={colors.textMuted} />
                        <Text style={[styles.productLocation, { color: colors.textMuted }]} numberOfLines={1}>
                          {vehicle.city}/{vehicle.state}
                        </Text>
                      </View>

                      <View style={[styles.viewDetailsBtn, { borderColor: colors.brand }]}>
                        <Text style={{ color: colors.brand, fontSize: 10, fontWeight: 'bold' }}>VER DETALHES</Text>
                      </View>
                    </View>
                  </PecaeGlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </PecaeBackground>
  );
}
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  filterToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedFilters: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterInput: {
    flex: 1,
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: {
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  resultsGrid: {
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
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
    gap: 6,
  },
  productTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productLocation: {
    fontSize: 10,
  },
  viewDetailsBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

