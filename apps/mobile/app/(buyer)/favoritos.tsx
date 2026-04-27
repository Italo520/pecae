import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../src/hooks/useFavorites';
import { usePecaeTheme } from '../../src/theme';

export default function FavoritosScreen() {
  const router = useRouter();
  const { colors, typography } = usePecaeTheme();
  const { getFavorites, toggleFavorite } = useFavorites();

  const handleToggleFavorite = (listingId: string) => {
    toggleFavorite.mutate(listingId);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={() => router.push(`/(tabs)/vehicle/${item.listing.id}`)}
      >
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            {item.listing?.title || 'Anúncio sem título'}
          </Text>
          <Text style={[styles.cardPrice, { color: colors.brand, fontFamily: typography.mono }]}>
            {item.listing?.price ? `R$ ${item.listing.price}` : 'Preço sob consulta'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.listing.id)}
        >
          <Ionicons name="heart" size={24} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Favoritos',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
        }}
      />

      {getFavorites.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : getFavorites.isError ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.danger, fontFamily: typography.primary }]}>
            Erro ao carregar favoritos.
          </Text>
        </View>
      ) : (
        <FlashList
          data={getFavorites.data || []}
          renderItem={renderItem}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                Nenhum favorito ainda
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
                Os anúncios que você curtir aparecerão aqui.
              </Text>
            </View>
          }
          refreshing={getFavorites.isFetching}
          onRefresh={getFavorites.refetch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
