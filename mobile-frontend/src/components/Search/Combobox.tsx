import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onSelect: (value: string, label: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onOpen?: () => void;
}

export function Combobox({ 
  options, 
  value, 
  onSelect, 
  placeholder = 'Selecione...', 
  searchPlaceholder = 'Buscar...',
  disabled = false,
  isLoading = false,
  onOpen
}: ComboboxProps) {
  const { colors, typography } = usePecaeTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <Pressable 
        style={({ pressed }) => [
          styles.trigger, 
          { 
            borderColor: colors.border, 
            backgroundColor: disabled ? colors.surface + '80' : colors.surface 
          },
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => {
          if (!disabled) {
            setModalVisible(true);
            onOpen?.();
          }
        }}
        disabled={disabled}
      >
        <Text 
          style={[
            styles.triggerText, 
            { 
              color: selectedOption ? colors.textPrimary : colors.textMuted,
              fontFamily: typography.medium
            }
          ]}
          numberOfLines={1}
        >
          {isLoading ? 'Carregando...' : (selectedOption ? selectedOption.label : placeholder)}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.heading }]}>
                {placeholder}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary, fontFamily: typography.body }]}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem, 
                    { borderBottomColor: colors.border },
                    pressed && { opacity: 0.7 },
                    item.value === value && { backgroundColor: colors.surface }
                  ]}
                  onPress={() => {
                    onSelect(item.value, item.label);
                    setModalVisible(false);
                    setSearch('');
                  }}
                >
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: item.value === value ? colors.brand : colors.textPrimary,
                      fontFamily: item.value === value ? typography.heading : typography.body
                    }
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.brand} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum resultado encontrado.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  triggerText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
