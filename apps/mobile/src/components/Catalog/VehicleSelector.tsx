import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { usePecaeTheme } from '../../theme';
import { PecaeGlassCard } from '../PecaeUI/PecaeGlassCard';
import { useBrands, useModels, useVersions, useYears } from '../../hooks/useCatalog';
import { Ionicons } from '@expo/vector-icons';

type SelectionLevel = 'brand' | 'model' | 'version' | 'year';

interface VehicleSelectorProps {
  onSelect?: (selection: {
    brand: any;
    model: any;
    version: any;
    year: any;
  }) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ onSelect }) => {
  const { colors, typography, effects } = usePecaeTheme();
  
  const [level, setLevel] = useState<SelectionLevel>('brand');
  const [search, setSearch] = useState('');
  
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  // Queries
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: models, isLoading: loadingModels } = useModels(selectedBrand?.id);
  const { data: versions, isLoading: loadingVersions } = useVersions(selectedModel?.id);
  const { data: years, isLoading: loadingYears } = useYears(selectedVersion?.id);

  const currentData = useMemo(() => {
    let data = [];
    if (level === 'brand') data = brands || [];
    else if (level === 'model') data = models || [];
    else if (level === 'version') data = versions || [];
    else if (level === 'year') data = years || [];

    if (search) {
      return data.filter((item: any) => 
        (item.name || item.year?.toString()).toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [level, brands, models, versions, years, search]);

  const isLoading = loadingBrands || loadingModels || loadingVersions || loadingYears;

  const handleBack = () => {
    setSearch('');
    if (level === 'year') {
      setLevel('version');
    } else if (level === 'version') {
      setLevel('model');
    } else if (level === 'model') {
      setLevel('brand');
    }
  };

  const handleSelect = (item: any) => {
    setSearch('');
    if (level === 'brand') {
      setSelectedBrand(item);
      setLevel('model');
    } else if (level === 'model') {
      setSelectedModel(item);
      setLevel('version');
    } else if (level === 'version') {
      setSelectedVersion(item);
      setLevel('year');
    } else if (level === 'year') {
      onSelect?.({
        brand: selectedBrand,
        model: selectedModel,
        version: selectedVersion,
        year: item,
      });
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => handleSelect(item)}
      style={styles.itemContainer}
    >
      <PecaeGlassCard intensity={15} style={styles.card}>
        <View style={styles.itemContent}>
          <Text style={[styles.itemText, { color: colors.textPrimary, fontFamily: typography.medium }]}>
            {item.name || item.year}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.brand} />
        </View>
      </PecaeGlassCard>
    </TouchableOpacity>
  ), [level, colors, typography, selectedBrand, selectedModel, selectedVersion]);

  return (
    <View style={styles.container}>
      {/* Header / Breadcrumbs */}
      <View style={styles.header}>
        {level !== 'brand' && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>
            {level === 'brand' ? 'Selecione a Marca' : 
             level === 'model' ? 'Selecione o Modelo' :
             level === 'version' ? 'Selecione a Versão' : 'Selecione o Ano'}
          </Text>
          {selectedBrand && level !== 'brand' && (
            <Text style={[styles.subtitle, { color: colors.brand, fontFamily: typography.body }]}>
              {selectedBrand.name} {selectedModel ? `• ${selectedModel.name}` : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: typography.body }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlashList
          data={currentData}
          renderItem={renderItem}
          estimatedItemSize={80}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted, fontFamily: typography.body }}>
                Nenhum resultado encontrado.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 10,
  },
  card: {
    padding: 0, // Reset default padding from GlassCard to handle it inside
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemText: {
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
