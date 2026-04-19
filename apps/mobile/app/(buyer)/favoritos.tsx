import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../src/hooks/useFavorites';

export default function FavoritosScreen() {
  const router = useRouter();
  const { getFavorites, toggleFavorite } = useFavorites();

  const handleToggleFavorite = (listingId: string) => {
    toggleFavorite.mutate(listingId);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => console.log('Navigate to listing', item.listing.id)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.listing?.title || 'Anúncio sem título'}</Text>
          <Text style={styles.cardPrice}>
            {item.listing?.price ? `R$ ${item.listing.price}` : 'Preço sob consulta'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.listing.id)}
        >
          <Ionicons name="heart" size={24} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Favoritos',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#f8fafc" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#f8fafc',
        }}
      />

      {getFavorites.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : getFavorites.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro ao carregar favoritos.</Text>
        </View>
      ) : (
        <FlashList
          data={getFavorites.data || []}
          renderItem={renderItem}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color="#475569" />
              <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
              <Text style={styles.emptySubtitle}>
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
    backgroundColor: '#0f172a',
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardPrice: {
    color: '#94a3b8',
    fontSize: 14,
  },
  favoriteButton: {
    padding: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});
