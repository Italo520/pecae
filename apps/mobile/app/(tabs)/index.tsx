import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { PecaeBackground, PecaeGlassCard } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useListings } from '../../src/hooks/useVehicles';

export default function BuyerHomeScreen() {
  const { colors, typography } = usePecaeTheme();
  const { data: listings, isLoading } = useListings();

  return (
    <PecaeBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
            PECAÊ // TERMINAL
          </Text>
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
          <View style={styles.placeholderGrid}>
            {listings && listings.length > 0 ? (
              listings.map((vehicle: any) => (
                <PecaeGlassCard key={vehicle.id} intensity={10} style={styles.gridItem}>
                  {vehicle.photos && vehicle.photos.length > 0 ? (
                    <Image 
                      source={{ uri: vehicle.photos[0].url }} 
                      style={styles.placeholderImage} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: colors.textMuted, fontSize: 10 }}>SEM FOTO</Text>
                    </View>
                  )}
                  <Text 
                    style={[styles.itemTitle, { color: colors.textPrimary, fontFamily: typography.display }]}
                    numberOfLines={2}
                  >
                    {vehicle.listing?.title || `${vehicle.version?.model?.brand?.name} ${vehicle.version?.model?.name}`}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.brand, fontFamily: typography.mono }]}>
                    {vehicle.city} - {vehicle.state}
                  </Text>
                </PecaeGlassCard>
              ))
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
  title: {
    fontSize: 24,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
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
  placeholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    padding: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 4,
  },
});
