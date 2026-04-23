import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
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

  return (
    <PecaeBackground>
      <PecaeScreenContainer>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
            BUSCAR // COMPONENTES
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
        </View>

        <View style={styles.content}>
          <Ionicons name="construct-outline" size={48} color={colors.border} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
            Digite algo para iniciar a busca no inventário.
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
    fontSize: 18,
    letterSpacing: 2,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
  },
});
