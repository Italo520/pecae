import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PecaeBackground, 
  PecaeScreenContainer, 
  PecaeGlassCard 
} from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';

export default function SearchScreen() {
  const { colors, typography } = usePecaeTheme();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('relevancia');

  const sortOptions = [
    { id: 'relevancia', label: 'Relevância' },
    { id: 'preco_asc', label: 'Menor Preço' },
    { id: 'preco_desc', label: 'Maior Preço' },
  ];

  return (
    <PecaeBackground>
      <PecaeScreenContainer>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
            EXPLORAR // PEÇAS & VEÍCULOS
          </Text>
          
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, fontFamily: typography.body }]}
              placeholder="Ex: Motor AP, Para-choque Civic..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filtros de Ordenação */}
          <View style={styles.sortContainer}>
            {sortOptions.map((option) => {
              const isSelected = sortBy === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortBtn, 
                    { 
                      backgroundColor: isSelected ? colors.brand : colors.surface,
                      borderColor: isSelected ? colors.brand : colors.border
                    }
                  ]}
                  onPress={() => setSortBy(option.id)}
                >
                  <Text 
                    style={[
                      styles.sortBtnText, 
                      { 
                        color: isSelected ? '#000000' : colors.textPrimary,
                        fontFamily: typography.medium
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.content}>
          <Ionicons name="construct-outline" size={48} color={colors.border} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
            {search ? `Exibindo resultados ordenados por ${sortOptions.find(o => o.id === sortBy)?.label}...` : 'Digite algo para iniciar a busca no inventário.'}
          </Text>
        </View>
      </PecaeScreenContainer>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortBtnText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.6,
  },
});
