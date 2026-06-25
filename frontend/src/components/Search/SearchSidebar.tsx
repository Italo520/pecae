import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { Brand, Model, Version } from '../../hooks/useCatalog';
import { BottomSheetOption } from './BottomSheetSelector';

interface SearchSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;

  // Catalog Data
  brands: Brand[];
  models: Model[];
  versions: Version[];
  fuelTypes: BottomSheetOption[];
  mileageOptions: BottomSheetOption[];

  // Current State
  type?: string;
  brandId?: string;
  modelId?: string;
  versionId?: string;
  fuelType?: string;
  mileageMax?: number;
  state: string;
  city: string;

  // Setters
  setType: (type?: string) => void;
  setBrandId: (id?: string) => void;
  setModelId: (id?: string) => void;
  setVersionId: (id?: string) => void;
  setFuelType: (id?: string) => void;
  setMileageMax: (max?: number) => void;
  setState: (uf: string) => void;
  setCity: (city: string) => void;
}

export function SearchSidebar({
  brands,
  models,
  versions,
  fuelTypes,
  mileageOptions,
  type,
  brandId,
  modelId,
  versionId,
  fuelType,
  mileageMax,
  state,
  city,
  setType,
  setBrandId,
  setModelId,
  setVersionId,
  setFuelType,
  setMileageMax,
  setState,
  setCity,
  isCollapsed,
  onToggle,
}: SearchSidebarProps) {
  const { colors, typography } = usePecaeTheme();

  const renderFilterList = (
    title: string,
    options: { id: string; label: string }[],
    selectedValue?: string,
    onSelect?: (id: string) => void,
    onClear?: () => void
  ) => {
    if (options.length === 0 && !selectedValue) return null;

    // Show only a few options and a "See all" if needed (simplified for now, showing up to 10)
    const visibleOptions = options.slice(0, 15);
    const selectedLabel = options.find((o) => o.id === selectedValue)?.label || selectedValue;

    return (
      <View style={styles.filterGroup}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            {title}
          </Text>
          {selectedValue && onClear && (
            <TouchableOpacity onPress={onClear}>
              <Text style={{ color: colors.brand, fontSize: 12 }}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedValue ? (
          <TouchableOpacity style={styles.activeFilter} onPress={onClear}>
            <Ionicons name="close" size={14} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.activeFilterText, { color: colors.textPrimary, fontFamily: typography.medium }]}>
              {selectedLabel}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.optionsList}>
            {visibleOptions.map((opt) => (
              <TouchableOpacity key={opt.id} style={styles.optionRow} onPress={() => onSelect?.(opt.id)}>
                <Text style={[styles.optionText, { color: colors.textMuted, fontFamily: typography.body }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isCollapsed) {
    return (
      <View style={[styles.containerCollapsed, { borderRightColor: colors.border }]}>
        <TouchableOpacity style={styles.toggleBtnCollapsed} onPress={onToggle}>
          <Ionicons name="options-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { borderRightColor: colors.border }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>Filtros</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={onToggle}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Type Selection */}
        <View style={styles.filterGroup}>
          <Text style={[styles.groupTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            Tipo de Veículo
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'carro', label: 'Carros', icon: 'car-outline' },
              { id: 'moto', label: 'Motos', icon: 'bicycle-outline' },
              { id: 'caminhao', label: 'Caminhões', icon: 'bus-outline' },
              { id: 'outro', label: 'Outros', icon: 'construct-outline' }
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeButton,
                  { borderColor: colors.border },
                  type === t.id && { borderColor: colors.brand, backgroundColor: 'rgba(63, 255, 139, 0.1)' }
                ]}
                onPress={() => setType(type === t.id ? undefined : t.id)}
              >
                <Ionicons name={t.icon as any} size={16} color={type === t.id ? colors.brand : colors.textMuted} />
                <Text style={{ color: type === t.id ? colors.brand : colors.textMuted, fontSize: 13, marginLeft: 4 }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={[styles.groupTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            Localização
          </Text>
          {(state || city) && (
            <TouchableOpacity onPress={() => { setState(''); setCity(''); }}>
              <Text style={{ color: colors.brand, fontSize: 12 }}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, width: 60 }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, fontFamily: typography.body, textAlign: 'center' }]}
              placeholder="UF"
              placeholderTextColor={colors.textMuted}
              value={state}
              onChangeText={(val) => setState(val.toUpperCase().substring(0, 2))}
              maxLength={2}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, fontFamily: typography.body }]}
              placeholder="Cidade"
              placeholderTextColor={colors.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

      {/* Marca, Modelo, Versão */}
      {renderFilterList(
        'Marca',
        brands.map((b) => ({ id: b.id, label: b.name })),
        brandId,
        (id) => { setBrandId(id); setModelId(undefined); setVersionId(undefined); },
        () => { setBrandId(undefined); setModelId(undefined); setVersionId(undefined); }
      )}

      {brandId && renderFilterList(
        'Modelo',
        models.map((m) => ({ id: m.id, label: m.name })),
        modelId,
        (id) => { setModelId(id); setVersionId(undefined); },
        () => { setModelId(undefined); setVersionId(undefined); }
      )}

      {modelId && renderFilterList(
        'Versão',
        versions.map((v) => ({ id: v.id, label: v.name })),
        versionId,
        setVersionId,
        () => setVersionId(undefined)
      )}

      {/* Outros Filtros */}
      {renderFilterList(
        'Combustível',
        fuelTypes,
        fuelType,
        setFuelType,
        () => setFuelType(undefined)
      )}

      {renderFilterList(
        'Quilometragem',
        mileageOptions,
        mileageMax ? String(mileageMax) : undefined,
        (id) => setMileageMax(Number(id)),
        () => setMileageMax(undefined)
      )}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '25%',
    minWidth: 220,
    maxWidth: 350,
    borderRightWidth: 1,
    height: '100%',
  },
  containerCollapsed: {
    width: 60,
    borderRightWidth: 1,
    height: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  toggleBtnCollapsed: {
    padding: 8,
    borderRadius: 8,
  },
  toggleBtn: {
    padding: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  content: {
    paddingBottom: 100,
  },
  scrollContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 20,
    letterSpacing: 2,
  },
  filterGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 14,
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    paddingVertical: 2,
  },
  optionText: {
    fontSize: 13,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeFilterText: {
    fontSize: 13,
  },
});
