import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PecaeBackground, 
  PecaeGlassCard 
} from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { useSearchVehicles, useSearchSuggestions } from '../../src/hooks/useVehicles';
import { useBrands, useModels, useVersions } from '../../src/hooks/useCatalog';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';
import { useLocalSearchParams } from 'expo-router';
import { SponsoredListingCard } from '../../src/components/Ads/SponsoredListingCard';
import { VehicleCard } from '../../src/components/Vehicle';
import { PageContainer } from '../../src/components/Layout/PageContainer';
import { AppFooter } from '../../src/components/Layout/AppFooter';
import { useDeviceLayout } from '../../src/hooks/useDeviceLayout';
import { BottomSheetSelector, BottomSheetOption } from '../../src/components/Search/BottomSheetSelector';
import { SearchSidebar } from '../../src/components/Search/SearchSidebar';

const FUEL_TYPES: BottomSheetOption[] = [
  { id: 'FLEX', label: 'Flex' },
  { id: 'GASOLINA', label: 'Gasolina' },
  { id: 'ALCOOL', label: 'Álcool' },
  { id: 'DIESEL', label: 'Diesel' },
  { id: 'HIBRIDO', label: 'Híbrido' },
  { id: 'ELETRICO', label: 'Elétrico' },
];

const MILEAGE_OPTIONS: BottomSheetOption[] = [
  { id: '10000', label: 'Até 10.000 km' },
  { id: '30000', label: 'Até 30.000 km' },
  { id: '50000', label: 'Até 50.000 km' },
  { id: '80000', label: 'Até 80.000 km' },
  { id: '100000', label: 'Até 100.000 km' },
  { id: '150000', label: 'Até 150.000 km' },
];

const TYPE_OPTIONS: BottomSheetOption[] = [
  { id: 'carro', label: 'Carros' },
  { id: 'moto', label: 'Motos' },
  { id: 'caminhao', label: 'Caminhões' },
  { id: 'outro', label: 'Outros' },
];

type SheetType = 'type' | 'brand' | 'model' | 'version' | 'fuel' | 'mileage' | null;

export default function SearchScreen() {
  const { colors, typography } = usePecaeTheme();
  const { isMobile, isTablet } = useDeviceLayout();
  const isDesktop = !isMobile && !isTablet;
  const params = useLocalSearchParams();
  
  const initialQ = params.q ? String(params.q) : '';
  const [searchText, setSearchText] = useState(initialQ);
  const [debouncedSearchText, setDebouncedSearchText] = useState(initialQ);
  
  // Advanced Filters State
  const [type, setType] = useState<string | undefined>(params.type ? String(params.type) : undefined);
  const [brandId, setBrandId] = useState<string | undefined>(params.marca ? String(params.marca) : undefined);
  const [modelId, setModelId] = useState<string | undefined>(params.modelo ? String(params.modelo) : undefined);
  const [versionId, setVersionId] = useState<string | undefined>();
  const [fuelType, setFuelType] = useState<string | undefined>();
  const [mileageMax, setMileageMax] = useState<number | undefined>();
  const [city, setCity] = useState('');
  const [state, setState] = useState(params.state ? String(params.state) : '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Mobile only state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  // Catalog Queries
  const { data: brands = [], isLoading: isLoadingBrands } = useBrands(type);
  const { data: models = [], isLoading: isLoadingModels } = useModels(brandId);
  const { data: versions = [], isLoading: isLoadingVersions } = useVersions(modelId);

  // Hook de buscas salvas
  const { createSavedSearch } = useSavedSearches();

  // Debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const { data: suggestions = [] } = useSearchSuggestions(searchText);

  const { data: searchResponse, isLoading } = useSearchVehicles({
    q: debouncedSearchText,

    brandId,
    modelId,
    versionId,
    city: city || undefined,
    mileageMax,
  });

  const results = searchResponse?.data || [];

  const handleSaveSearch = async () => {
    try {
      await createSavedSearch.mutateAsync({
        query: debouncedSearchText,
        filters: {
          type: type as any,
          brandId,
          modelId,
          versionId,
          city: city || undefined,
          state: state || undefined,
        },
        alertActive: true,
      });
      alert('Busca salva com sucesso! Você será notificado quando novos doadores semelhantes entrarem no estoque.');
    } catch (error: any) {
      if (error?.response?.status === 401) {
        alert('Apenas usuários autenticados podem salvar buscas. Por favor, faça login ou cadastre-se.');
      } else {
        alert('Erro ao salvar busca. Tente novamente mais tarde.');
      }
    }
  };

  const getTypeLabel = () => TYPE_OPTIONS.find(t => t.id === type)?.label || 'Tipo';
  const getBrandLabel = () => brands.find(b => b.id === brandId)?.name || brandId || 'Marca';
  const getModelLabel = () => models.find(m => m.id === modelId)?.name || modelId || 'Modelo';
  const getVersionLabel = () => versions.find(v => v.id === versionId)?.name || versionId || 'Versão';
  const getFuelLabel = () => FUEL_TYPES.find(f => f.id === fuelType)?.label || 'Combustível';
  const getMileageLabel = () => MILEAGE_OPTIONS.find(m => m.id === String(mileageMax))?.label || 'Quilometragem';

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search-outline" size={48} color={colors.border} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
        {debouncedSearchText || brandId ? 'NENHUM RESULTADO' : 'EXPLORE A FORJA'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
        {debouncedSearchText || brandId
          ? 'Não encontramos veículos com esses filtros. Tente termos mais genéricos ou salve sua busca para receber alertas.'
          : 'Busque por peças, modelos ou marcas específicas no inventário.'}
      </Text>
      {(debouncedSearchText || brandId || city || state) && (
        <TouchableOpacity 
          style={[styles.saveSearchButton, { backgroundColor: colors.brand }]} 
          onPress={handleSaveSearch}
          disabled={createSavedSearch.isPending}
        >
          <Text style={[styles.saveSearchButtonText, { color: '#ffffff', fontFamily: typography.medium }]}>
            {createSavedSearch.isPending ? 'SALVANDO...' : 'SALVAR BUSCA E ME ALERTAR'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <PecaeBackground>
      {/* HEADER: Search Bar and (on mobile) Filter Toggle */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchRow, isDesktop && styles.searchRowDesktop]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}>
            <Ionicons name="search" size={20} color={colors.brand} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, fontFamily: typography.body }]}
              placeholder="Digite o que procura (ex: Motor Gol 1.0)"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          
          {!isDesktop && (
            <TouchableOpacity 
              style={[styles.filterToggle, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Ionicons name="options-outline" size={24} color={showMobileFilters ? colors.brand : colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <PecaeGlassCard intensity={25} style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.suggestionsScroll}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={`${suggestion.type}-${suggestion.id}`}
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    if (suggestion.type === 'BRAND') {
                      setBrandId(suggestion.id);
                      setModelId(undefined);
                      setVersionId(undefined);
                      setSearchText('');
                    } else {
                      setSearchText(suggestion.text);
                    }
                    setShowSuggestions(false);
                  }}
                >
                  <Ionicons name={suggestion.type === 'BRAND' ? 'car-sport-outline' : 'pricetag-outline'} size={16} color={colors.brand} />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={[styles.suggestionText, { color: colors.textPrimary, fontFamily: typography.medium }]}>{suggestion.text}</Text>
                    <Text style={[styles.suggestionType, { color: colors.textMuted, fontFamily: typography.body }]}>
                      {suggestion.type === 'BRAND' ? 'Marca' : 'Modelo'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </PecaeGlassCard>
        )}

        {/* Mobile Cascade Filters */}
        {!isDesktop && showMobileFilters && (
          <View style={styles.mobileFiltersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              <View style={[styles.filterInput, { backgroundColor: colors.surface, borderColor: colors.border, width: 60 }]}>
                <TextInput
                  style={{ color: colors.textPrimary, flex: 1, fontSize: 12, textAlign: 'center' }}
                  placeholder="UF"
                  placeholderTextColor={colors.textMuted}
                  value={state}
                  onChangeText={(val) => setState(val.toUpperCase().substring(0, 2))}
                  maxLength={2}
                />
              </View>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: type ? `${colors.brand}15` : colors.surface, borderColor: type ? colors.brand : colors.border }]} onPress={() => setActiveSheet('type')}>
                <Text style={{ color: type ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: type ? typography.medium : typography.body }}>{getTypeLabel()}</Text>
                {type && <Ionicons name="close" size={14} color={colors.brand} onPress={() => { setType(undefined); setBrandId(undefined); setModelId(undefined); setVersionId(undefined); }} />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: brandId ? `${colors.brand}15` : colors.surface, borderColor: brandId ? colors.brand : colors.border }]} onPress={() => setActiveSheet('brand')}>
                <Text style={{ color: brandId ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: brandId ? typography.medium : typography.body }}>{getBrandLabel()}</Text>
                {brandId && <Ionicons name="close" size={14} color={colors.brand} onPress={() => { setBrandId(undefined); setModelId(undefined); setVersionId(undefined); }} />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: modelId ? `${colors.brand}15` : colors.surface, borderColor: modelId ? colors.brand : colors.border, opacity: brandId ? 1 : 0.5 }]} onPress={() => brandId && setActiveSheet('model')} disabled={!brandId}>
                <Text style={{ color: modelId ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: modelId ? typography.medium : typography.body }}>{getModelLabel()}</Text>
                {modelId && <Ionicons name="close" size={14} color={colors.brand} onPress={() => { setModelId(undefined); setVersionId(undefined); }} />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: versionId ? `${colors.brand}15` : colors.surface, borderColor: versionId ? colors.brand : colors.border, opacity: modelId ? 1 : 0.5 }]} onPress={() => modelId && setActiveSheet('version')} disabled={!modelId}>
                <Text style={{ color: versionId ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: versionId ? typography.medium : typography.body }}>{getVersionLabel()}</Text>
                {versionId && <Ionicons name="close" size={14} color={colors.brand} onPress={() => setVersionId(undefined)} />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: fuelType ? `${colors.brand}15` : colors.surface, borderColor: fuelType ? colors.brand : colors.border }]} onPress={() => setActiveSheet('fuel')}>
                <Text style={{ color: fuelType ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: fuelType ? typography.medium : typography.body }}>{getFuelLabel()}</Text>
                {fuelType && <Ionicons name="close" size={14} color={colors.brand} onPress={() => setFuelType(undefined)} />}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filterChip, { backgroundColor: mileageMax ? `${colors.brand}15` : colors.surface, borderColor: mileageMax ? colors.brand : colors.border }]} onPress={() => setActiveSheet('mileage')}>
                <Text style={{ color: mileageMax ? colors.brand : colors.textPrimary, fontSize: 12, fontFamily: mileageMax ? typography.medium : typography.body }}>{getMileageLabel()}</Text>
                {mileageMax && <Ionicons name="close" size={14} color={colors.brand} onPress={() => setMileageMax(undefined)} />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* BODY */}
      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        
        {/* DESKTOP SIDEBAR */}
        {isDesktop && (
          <SearchSidebar
            isCollapsed={!isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            brands={brands}
            models={models}
            versions={versions}
            fuelTypes={FUEL_TYPES}
            mileageOptions={MILEAGE_OPTIONS}
            type={type}
            brandId={brandId}
            modelId={modelId}
            versionId={versionId}
            fuelType={fuelType}
            mileageMax={mileageMax}
            state={state}
            city={city}
            setType={setType}
            setBrandId={setBrandId}
            setModelId={setModelId}
            setVersionId={setVersionId}
            setFuelType={setFuelType}
            setMileageMax={setMileageMax}
            setState={setState}
            setCity={setCity}
          />
        )}

        {/* RESULTS AREA */}
        <PageContainer contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={[styles.loaderText, { color: colors.textMuted, fontFamily: typography.body }]}>
                VASCULHANDO O ESTOQUE...
              </Text>
            </View>
          ) : results.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={[styles.resultsGrid, { paddingHorizontal: isDesktop ? 40 : 20 }]}>
              {results.map((vehicle: any) => {
                if (vehicle.isSponsored) {
                  return <SponsoredListingCard key={`sponsored-${vehicle.id}`} vehicle={vehicle} style={[
                    { marginBottom: 24 },
                    isDesktop ? { width: 272 } : { flex: 1, minWidth: 260 }
                  ]} />;
                }
                const brand = vehicle.version?.model?.brand?.name || vehicle.brand || '';
                const model = vehicle.version?.model?.name || vehicle.model || '';
                const version = vehicle.version?.name || vehicle.version || '';
                const imageUrl = vehicle.thumbnail || (vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos[0] : null);

                return (
                  <VehicleCard
                    key={vehicle.id}
                    id={vehicle.id}
                    brand={brand}
                    model={model}
                    version={version}
                    year={vehicle.yearFab}
                    mileage={vehicle.mileage}
                    fuel={vehicle.fuelType}
                    city={vehicle.city}
                    state={vehicle.state}
                    imageUrl={imageUrl}
                    style={[
                      { marginBottom: 24 },
                      isDesktop ? { width: 272 } : { flex: 1, minWidth: 260 }
                    ]}
                  />
                );
              })}
            </View>
          )}
          {isDesktop && <AppFooter />}
        </PageContainer>
      </View>

      {/* MOBILE BOTTOM SHEETS */}
      {!isDesktop && (
        <>
          <BottomSheetSelector visible={activeSheet === 'type'} onClose={() => setActiveSheet(null)} title="Tipo" options={TYPE_OPTIONS} selectedValue={type} onSelect={(id) => { setType(id); setBrandId(undefined); setModelId(undefined); setVersionId(undefined); }} searchable={false} />
          <BottomSheetSelector visible={activeSheet === 'brand'} onClose={() => setActiveSheet(null)} title="Marca" options={brands.map(b => ({ id: b.id, label: b.name }))} selectedValue={brandId} onSelect={(id) => { setBrandId(id); setModelId(undefined); setVersionId(undefined); }} />
          <BottomSheetSelector visible={activeSheet === 'model'} onClose={() => setActiveSheet(null)} title="Modelo" options={models.map(m => ({ id: m.id, label: m.name }))} selectedValue={modelId} onSelect={(id) => { setModelId(id); setVersionId(undefined); }} />
          <BottomSheetSelector visible={activeSheet === 'version'} onClose={() => setActiveSheet(null)} title="Versão" options={versions.map(v => ({ id: v.id, label: v.name }))} selectedValue={versionId} onSelect={(id) => setVersionId(id)} />
          <BottomSheetSelector visible={activeSheet === 'fuel'} onClose={() => setActiveSheet(null)} title="Combustível" options={FUEL_TYPES} selectedValue={fuelType} onSelect={(id) => setFuelType(id)} searchable={false} />
          <BottomSheetSelector visible={activeSheet === 'mileage'} onClose={() => setActiveSheet(null)} title="Quilometragem" options={MILEAGE_OPTIONS} selectedValue={String(mileageMax)} onSelect={(id) => setMileageMax(Number(id))} searchable={false} />
        </>
      )}

    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 0,
  },
  searchRowDesktop: {
    maxWidth: 800, // Limit width on desktop
    alignSelf: 'center',
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileFiltersRow: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  filterInput: {
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  body: {
    flex: 1,
  },
  bodyDesktop: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 10,
    letterSpacing: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: {
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 70,
    left: 20,
    right: 80,
    maxHeight: 250,
    borderRadius: 16,
    zIndex: 1000,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  suggestionsScroll: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  suggestionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
  },
  suggestionType: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveSearchButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSearchButtonText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
