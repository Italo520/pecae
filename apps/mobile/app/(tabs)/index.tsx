import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PecaeBackground, PecaeGlassCard } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useListings } from '../../src/hooks/useVehicles';
import { useUIStore } from '../../src/store/ui-store';
import { getVehicleImage } from '../../src/utils/vehicleImages';
import { Ionicons } from '@expo/vector-icons';

export default function BuyerHomeScreen() {
  const { colors, typography } = usePecaeTheme();
  const { viewMode, themeMode, setViewMode, setThemeMode, initializeUI } = useUIStore();
  const { data: listings, isLoading } = useListings();

  useEffect(() => {
    initializeUI();
  }, []);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <PecaeBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
              PECAÊ // TERMINAL
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={[styles.iconButton, { backgroundColor: colors.surface }]}
                accessibilityLabel="Alternar Tema"
              >
                <Ionicons 
                  name={themeMode === 'dark' ? 'sunny' : 'moon'} 
                  size={20} 
                  color={colors.brand} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleViewMode} 
                style={[styles.iconButton, { backgroundColor: colors.surface }]}
                accessibilityLabel="Alternar Visualização"
              >
                <Ionicons 
                  name={viewMode === 'grid' ? 'list' : 'grid'} 
                  size={20} 
                  color={colors.brand} 
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
            Sincronizado com a Rede de Peças Automotivas.
          </Text>
        </View>

        <PecaeGlassCard intensity={20} style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.brand, fontFamily: typography.display }]}>
            SISTEMA OPERACIONAL
          </Text>
          <Text style={[styles.cardText, { color: colors.textPrimary, fontFamily: typography.body }]}>
            Bem-vindo ao terminal de busca. Encontre componentes e veículos com procedência verificada.
          </Text>
        </PecaeGlassCard>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 20 }} />
        ) : (
          <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
            {listings && listings.length > 0 ? (
              listings.map((vehicle: any) => {
                const brand = vehicle.listing?.brand || vehicle.version?.model?.brand?.name;
                const model = vehicle.listing?.model || vehicle.version?.model?.name;
                const imageUrl = getVehicleImage(brand, model, vehicle.id);
                const title = vehicle.listing?.title || `${brand || ''} ${model || ''}`;
                const price = vehicle.listing?.price 
                  ? `R$ ${vehicle.listing.price.toLocaleString('pt-BR')}`
                  : 'Sob Consulta';
                const year = vehicle.listing?.yearFab || vehicle.yearFabId || 'N/A';

                if (viewMode === 'grid') {
                  return (
                    <PecaeGlassCard key={vehicle.id} intensity={10} style={styles.gridItem}>
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.gridImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.cardContent}>
                        <Text 
                          style={[styles.itemTitle, { color: colors.textPrimary, fontFamily: typography.display }]}
                          numberOfLines={1}
                        >
                          {title}
                        </Text>
                        <Text style={[styles.itemPrice, { color: colors.brand, fontFamily: typography.mono }]}>
                          {price}
                        </Text>
                        <Text style={[styles.itemDetails, { color: colors.textMuted, fontFamily: typography.body }]}>
                          {year} | {vehicle.city}
                        </Text>
                      </View>
                    </PecaeGlassCard>
                  );
                }

                return (
                  <PecaeGlassCard key={vehicle.id} intensity={10} style={styles.listItem}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.listImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.listContent}>
                      <Text 
                        style={[styles.itemTitle, { color: colors.textPrimary, fontFamily: typography.display }]}
                        numberOfLines={2}
                      >
                        {title}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.brand, fontFamily: typography.mono }]}>
                        {price}
                      </Text>
                      <Text style={[styles.itemDetails, { color: colors.textMuted, fontFamily: typography.body }]}>
                        Ano: {year} | {vehicle.city} - {vehicle.state}
                      </Text>
                    </View>
                  </PecaeGlassCard>
                );
              })
            ) : (
              <Text style={[styles.cardText, { color: colors.textMuted, fontFamily: typography.body, width: '100%', textAlign: 'center', marginTop: 20 }]}>
                Nenhum veículo disponível no momento.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    letterSpacing: 4,
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  card: {
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 2,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  listContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
  },
  listItem: {
    width: '100%',
    padding: 0,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 12,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  listImage: {
    width: 120,
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    opacity: 0.8,
  },
});

