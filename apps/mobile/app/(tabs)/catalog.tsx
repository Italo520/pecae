import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { VehicleSelector } from '../../src/components/Catalog';
import { PecaeScreenContainer } from '../../src/components/PecaeUI/PecaeScreenContainer';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';
import { PecaeGlassCard } from '../../src/components/PecaeUI/PecaeGlassCard';
import { usePecaeTheme } from '../../theme';
import { useSearchVehicles, VehicleDonor } from '../../src/hooks/useVehicles';
import { Ionicons } from '@expo/vector-icons';

export default function CatalogScreen() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();
  const [filters, setFilters] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(true);

  const { data, isLoading } = useSearchVehicles(filters);

  const handleSelect = (selection: any) => {
    if (!selection) {
      setFilters(null);
      return;
    }
    
    setFilters({
      brandId: selection.brand?.id,
      modelId: selection.model?.id,
      versionId: selection.version?.id,
      yearMin: selection.year?.yearFab,
      yearMax: selection.year?.yearFab,
    });
    setIsSelecting(false);
  };

  const renderVehicle = ({ item }: { item: VehicleDonor }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push(`/(tabs)/vehicle/${item.id}`)}
      style={styles.cardWrapper}
    >
      <View style={styles.imageOverlapContainer}>
        <PecaeGlassCard padding={0} intensity={20} style={styles.vehicleCard}>
          <View style={styles.imagePlaceholder} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.brandLabel, { color: colors.brand, fontFamily: typography.display }]}>
                {item.brand.toUpperCase()}
              </Text>
              <View style={[styles.badge, { backgroundColor: 'rgba(63, 255, 139, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: colors.brand }]}>DOADOR</Text>
              </View>
            </View>
            
            <Text style={[styles.modelText, { color: colors.textPrimary, fontFamily: typography.display }]}>
              {item.model}
            </Text>
            
            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.specText, { color: colors.textMuted, fontFamily: typography.medium }]}>{item.yearFab}</Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.specText, { color: colors.textMuted, fontFamily: typography.medium }]}>{item.city}/{item.state}</Text>
              </View>
            </View>

            <View style={[styles.inventoryTag, { borderTopColor: colors.border }]}>
              <Ionicons name="layers-outline" size={14} color={colors.brand} />
              <Text style={[styles.inventoryText, { color: colors.textPrimary, fontFamily: typography.display }]}>
                {item.availablePartsCount} PEÇAS NA FORJA
              </Text>
            </View>
          </View>
        </PecaeGlassCard>

        {/* Floating Image Overlap Effect */}
        <View style={styles.floatingImageContainer}>
          <Image 
            source={{ uri: item.thumbnail || 'https://via.placeholder.com/400x300?text=Sem+Foto' }} 
            style={styles.floatingImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <PecaeBackground>
      <PecaeScreenContainer>
        <Stack.Screen 
          options={{ 
            title: 'Catálogo',
            headerShown: false 
          }} 
        />
        
        <View style={styles.container}>
          {isSelecting ? (
            <VehicleSelector onSelect={handleSelect} />
          ) : (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <TouchableOpacity 
                  onPress={() => setIsSelecting(true)}
                  style={styles.backButton}
                >
                  <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.resultsTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                  SUCATAS DISPONÍVEIS
                </Text>
              </View>

              {isLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.brand} />
                </View>
              ) : (
                <FlatList
                  data={data?.data || []}
                  renderItem={renderVehicle}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.center}>
                      <Ionicons name="car-sport-outline" size={64} color={colors.textMuted} />
                      <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
                        Nenhum veículo doador encontrado para este modelo.
                      </Text>
                      <TouchableOpacity 
                        onPress={() => setIsSelecting(true)}
                        style={[styles.retryButton, { borderColor: colors.brand }]}
                      >
                        <Text style={{ color: colors.brand, fontFamily: typography.display }}>TENTAR OUTRO MODELO</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              )}
            </View>
          )}
        </View>
      </PecaeScreenContainer>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    marginRight: 10,
  },
  resultsTitle: {
    fontSize: 20,
    letterSpacing: 2,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 24,
  },
  imageOverlapContainer: {
    position: 'relative',
    paddingTop: 60,
  },
  vehicleCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
  },
  floatingImageContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 180,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingImage: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandLabel: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.7,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modelText: {
    fontSize: 22,
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
  },
  inventoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  inventoryText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
