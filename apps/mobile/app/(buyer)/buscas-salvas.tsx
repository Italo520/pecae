import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';

export default function BuscasSalvasScreen() {
  const router = useRouter();
  const { getSavedSearches, toggleAlert, deleteSavedSearch, createSavedSearch } = useSavedSearches();
  
  const [newSearch, setNewSearch] = useState('');

  const handleToggleAlert = (id: string, currentStatus: boolean) => {
    toggleAlert.mutate({ id, alertActive: !currentStatus });
  };

  const handleRemoveSearch = (id: string) => {
    deleteSavedSearch.mutate(id);
  };

  const handleAddSearch = () => {
    if (!newSearch.trim()) return;
    createSavedSearch.mutate(
      { query: newSearch, alertActive: true },
      {
        onSuccess: () => {
          setNewSearch('');
        }
      }
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.query || 'Busca sem termo'}</Text>
          <Text style={styles.cardDate}>
            Salva em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Alertas</Text>
            <Switch
              value={item.alertActive}
              onValueChange={() => handleToggleAlert(item.id, item.alertActive)}
              trackColor={{ false: '#334155', true: '#3b82f6' }}
              thumbColor={'#f8fafc'}
            />
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemoveSearch(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Buscas Salvas',
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

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Salvar nova busca..."
          placeholderTextColor="#94a3b8"
          value={newSearch}
          onChangeText={setNewSearch}
        />
        <TouchableOpacity 
          style={[styles.addButton, !newSearch.trim() && styles.addButtonDisabled]} 
          onPress={handleAddSearch}
          disabled={!newSearch.trim() || createSavedSearch.isPending}
        >
          {createSavedSearch.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.limitInfo}>
        <Text style={styles.limitText}>
          {getSavedSearches.data?.length || 0} / 10 buscas salvas
        </Text>
      </View>

      {getSavedSearches.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : getSavedSearches.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro ao carregar buscas salvas.</Text>
        </View>
      ) : (
        <FlashList
          data={getSavedSearches.data || []}
          renderItem={renderItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#475569" />
              <Text style={styles.emptyTitle}>Nenhuma busca salva</Text>
              <Text style={styles.emptySubtitle}>
                Salve suas buscas para ser alertado quando novos anúncios chegarem.
              </Text>
            </View>
          }
          refreshing={getSavedSearches.isFetching}
          onRefresh={getSavedSearches.refetch}
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
  addSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#f8fafc',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#334155',
  },
  limitInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  limitText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#cbd5e1',
    marginRight: 8,
    fontSize: 14,
  },
  deleteButton: {
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
    paddingHorizontal: 32,
  },
});
