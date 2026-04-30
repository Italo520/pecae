import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';
import { usePecaeTheme } from '../../src/theme';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';

export default function BuscasSalvasScreen() {
  const router = useRouter();
  const { colors, typography } = usePecaeTheme();
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
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            {item.query || 'Busca sem termo'}
          </Text>
          <Text style={[styles.cardDate, { color: colors.textMuted, fontFamily: typography.mono }]}>
            Salva em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Alertas
            </Text>
            <Switch
              value={item.alertActive}
              onValueChange={() => handleToggleAlert(item.id, item.alertActive)}
              trackColor={{ false: colors.border, true: colors.brand }}
              thumbColor={'#ffffff'}
            />
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemoveSearch(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <PecaeBackground>
      <Stack.Screen 
        options={{
          title: 'Buscas Salvas',
        }}
      />

      <View style={[styles.addSection, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, fontFamily: typography.body }]}
          placeholder="Salvar nova busca..."
          placeholderTextColor={colors.textMuted}
          value={newSearch}
          onChangeText={setNewSearch}
        />
        <TouchableOpacity 
          style={[
            styles.addButton, 
            { backgroundColor: newSearch.trim() ? colors.brand : colors.surface },
            !newSearch.trim() && styles.addButtonDisabled
          ]} 
          onPress={handleAddSearch}
          disabled={!newSearch.trim() || createSavedSearch.isPending}
        >
          {createSavedSearch.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="add" size={24} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.limitInfo}>
        <Text style={[styles.limitText, { color: colors.textMuted, fontFamily: typography.mono }]}>
          {getSavedSearches.data?.length || 0} / 10 buscas salvas
        </Text>
      </View>

      {getSavedSearches.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : getSavedSearches.isError ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.body }]}>
            Erro ao carregar buscas salvas.
          </Text>
        </View>
      ) : (
        <FlashList
          data={getSavedSearches.data || []}
          renderItem={renderItem}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                Nenhuma busca salva
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
                Salve suas buscas para ser alertado quando novos anúncios chegarem.
              </Text>
            </View>
          }
          refreshing={getSavedSearches.isFetching}
          onRefresh={getSavedSearches.refetch}
        />
      )}
    </PecaeBackground>
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
  addSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  limitInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  limitText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  deleteButton: {
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
