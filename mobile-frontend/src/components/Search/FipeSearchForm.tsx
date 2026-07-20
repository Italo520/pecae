import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import { Combobox } from './Combobox';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useDeviceLayout } from '../../hooks/useDeviceLayout';

const FIPE_BASE_URL = 'https://fipe.parallelum.com.br/api/v2/cars';

const CURRENT_YEAR = new Date().getFullYear() + 1; // Allows for next year's models
const YEARS_OPTIONS = Array.from({ length: 40 }, (_, i) => ({
  value: String(CURRENT_YEAR - i),
  label: String(CURRENT_YEAR - i)
}));

export function FipeSearchForm({ hasBanner = true }: { hasBanner?: boolean }) {
  const { colors, typography, effects } = usePecaeTheme();
  const router = useRouter();
  const { isTablet } = useDeviceLayout();

  const [brands, setBrands] = useState<{value: string, label: string}[]>([]);
  const [models, setModels] = useState<{value: string, label: string}[]>([]);
  
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedBrandLabel, setSelectedBrandLabel] = useState<string>('');
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedModelLabel, setSelectedModelLabel] = useState<string>('');

  const [brandsFetched, setBrandsFetched] = useState(false);

  const handleOpenBrands = async () => {
    if (brandsFetched || isLoadingBrands) return;
    setIsLoadingBrands(true);
    try {
      const res = await fetch(`${FIPE_BASE_URL}/brands`);
      const data = await res.json();
      setBrands(data.map((item: any) => ({
        value: item.code,
        label: item.name
      })));
      setBrandsFetched(true);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  useEffect(() => {
    if (selectedBrand) {
      async function fetchModels() {
        setIsLoadingModels(true);
        try {
          const res = await fetch(`${FIPE_BASE_URL}/brands/${selectedBrand}/models`);
          const data = await res.json();
          setModels(data.map((item: any) => ({
            value: item.code,
            label: item.name
          })));
        } catch (err) {
          console.error('Failed to fetch models:', err);
        } finally {
          setIsLoadingModels(false);
        }
      }
      fetchModels();
    } else {
      setModels([]);
    }
    // Reset model when brand changes
    setSelectedModel('');
    setSelectedModelLabel('');
  }, [selectedBrand]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedBrandLabel) params.append('marca', selectedBrandLabel);
    if (selectedYear) params.append('ano', selectedYear);
    if (selectedModelLabel) params.append('modelo', selectedModelLabel);

    const queryString = params.toString();
    router.push(`/(tabs)/search${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <View style={[
      styles.container, 
      isTablet && { marginHorizontal: 32 }, 
      { backgroundColor: colors.surface }, 
      !hasBanner && { marginTop: 24 }
    ]}>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>
        Busque a peça certa para o seu veículo
      </Text>
      
      <View style={[styles.formContent, isTablet && styles.formContentTablet]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.medium }]}>Marca</Text>
          <Combobox
            options={brands}
            value={selectedBrand}
            onSelect={(val, label) => {
              setSelectedBrand(val);
              setSelectedBrandLabel(label);
            }}
            placeholder="Ex: Fiat"
            searchPlaceholder="Buscar marca..."
            isLoading={isLoadingBrands}
            onOpen={handleOpenBrands}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.medium }]}>Ano</Text>
          <Combobox
            options={YEARS_OPTIONS}
            value={selectedYear}
            onSelect={(val) => setSelectedYear(val)}
            placeholder="Ex: 2022"
            searchPlaceholder="Buscar ano..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.medium }]}>Modelo</Text>
          <Combobox
            options={models}
            value={selectedModel}
            onSelect={(val, label) => {
              setSelectedModel(val);
              setSelectedModelLabel(label);
            }}
            placeholder="Ex: Toro"
            searchPlaceholder="Buscar modelo..."
            isLoading={isLoadingModels}
            disabled={!selectedBrand}
          />
        </View>

        <View style={[styles.buttonGroup, isTablet && styles.buttonGroupTablet]}>
          <Pressable 
            style={({ pressed }) => [styles.searchButton, { backgroundColor: colors.brand }, pressed && { opacity: 0.7 }]} 
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color="#000" />
            <Text style={[styles.searchButtonText, { fontFamily: typography.heading }]}>BUSCAR</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: -40, // Overlaps the banner or header slightly
    marginBottom: 24,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  formContent: {
    flexDirection: 'column',
    gap: 16,
  },
  formContentTablet: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 200,
    gap: 8,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    marginTop: 8,
  },
  buttonGroupTablet: {
    marginTop: 0,
    flex: 0,
    minWidth: 140,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  searchButtonText: {
    color: '#000',
    fontSize: 14,
    letterSpacing: 1,
  },
});
