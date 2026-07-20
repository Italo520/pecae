import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { useRouter } from 'expo-router';

const STATES = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' }
];

export function VehicleSearchBar() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('PB');
  const [showStateModal, setShowStateModal] = useState(false);

  const handleSearch = () => {
    // Navigate to Search tab with params
    router.push({
      pathname: '/(tabs)/search',
      params: { q: searchText, state: selectedState }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* State Dropdown */}
      <Pressable 
        style={({ pressed }) => [styles.stateSelector, { borderRightColor: colors.border }, pressed && { opacity: 0.7 }]} 
        onPress={() => setShowStateModal(true)}
      >
        <Ionicons name="location-outline" size={16} color={colors.brand} />
        <Text style={[styles.stateText, { color: colors.textPrimary, fontFamily: typography.medium }]}>
          {selectedState}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </Pressable>

      {/* Input Placeholder (Redirects to Search Screen) */}
      <Pressable 
        style={({ pressed }) => [styles.input, { justifyContent: 'center' }, pressed && { opacity: 0.7 }]} 
        onPress={() => router.push('/(tabs)/search')}
      >
        <Text style={{ color: colors.textMuted, fontFamily: typography.body }}>
          Estou procurando...
        </Text>
      </Pressable>

      {/* Search Button */}
      <Pressable style={({ pressed }) => [styles.searchBtn, { backgroundColor: colors.brand }, pressed && { opacity: 0.7 }]} onPress={() => router.push('/(tabs)/search')}>
        <Ionicons name="search" size={18} color="#000" />
      </Pressable>

      {/* State Modal */}
      <Modal visible={showStateModal} transparent animationType="fade">
        <Pressable style={({ pressed }) => [styles.modalOverlay, pressed && { opacity: 0.7 }]} onPress={() => setShowStateModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
              Selecione o Estado
            </Text>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={({ pressed }) => [styles.stateItem, { borderBottomColor: colors.border }, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setSelectedState(item.id);
                    setShowStateModal(false);
                  }}
                >
                  <Text style={[
                    styles.stateItemText, 
                    { color: colors.textPrimary, fontFamily: typography.body },
                    selectedState === item.id && { color: colors.brand, fontFamily: typography.heading }
                  ]}>
                    {item.name}
                  </Text>
                  {selectedState === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.brand} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderRightWidth: 1,
    gap: 4,
  },
  stateText: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  stateItemText: {
    fontSize: 14,
  },
});
