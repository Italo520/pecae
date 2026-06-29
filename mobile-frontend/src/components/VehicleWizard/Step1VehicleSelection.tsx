import React from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { VehicleSelector } from '../Catalog/VehicleSelector';
import { useVehicleWizardStore } from '../../store/vehicle-wizard-store';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';

const TYPES = [
  { id: 'carro', label: 'Carros', icon: 'car-sport-outline' as const },
  { id: 'moto', label: 'Motos', icon: 'bicycle-outline' as const },
  { id: 'caminhao', label: 'Caminhões', icon: 'bus-outline' as const },
  { id: 'outro', label: 'Outros', icon: 'construct-outline' as const },
];

export const Step1VehicleSelection: React.FC = () => {
  const { data, updateData, nextStep } = useVehicleWizardStore();
  const { colors, typography } = usePecaeTheme();

  const handleSelect = (selection: any) => {
    const isCustomVersion = selection.version.id === 'custom';
    const isCustomYear = selection.year.id === 'custom';

    updateData({
      // Seletor padrão de catálogo
      brandId: selection.brand.id === 'custom' ? undefined : selection.brand.id,
      modelId: selection.model.id === 'custom' ? undefined : selection.model.id,
      versionId: isCustomVersion ? undefined : selection.version.id,
      yearFabId: isCustomYear ? undefined : selection.year.id,

      // Valores customizados se o preenchimento for livre
      customBrandName: isCustomVersion ? selection.brand.name : undefined,
      customModelName: isCustomVersion ? selection.model.name : undefined,
      customVersionName: isCustomVersion ? selection.version.name : undefined,
      customYearFab: isCustomYear ? selection.year.yearFab : undefined,
      customYearModel: isCustomYear ? selection.year.yearModel : undefined,
    });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeContainer}>
        <Text style={[styles.typeTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
          Selecione o Tipo
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
          {TYPES.map((type) => {
            const isSelected = data.vehicleType === type.id;
            return (
              <Pressable
                key={type.id}
                style={({ pressed }) => [[
                  styles.typeButton,
                  { backgroundColor: colors.surface, borderColor: colors.border , pressed && { opacity: 0.7 }]},
                  isSelected && { borderColor: colors.brand, backgroundColor: 'rgba(63, 255, 139, 0.1)' }
                ]}
                onPress={() => updateData({ vehicleType: type.id, brandId: undefined, modelId: undefined, versionId: undefined, yearFabId: undefined })}
              >
                <Ionicons name={type.icon} size={24} color={isSelected ? colors.brand : colors.textMuted} />
                <Text style={[
                  styles.typeLabel,
                  { color: isSelected ? colors.brand : colors.textPrimary, fontFamily: typography.medium }
                ]}>
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {data.vehicleType ? (
        <VehicleSelector 
          onSelect={handleSelect} 
          requireCompleteSelection={true} 
          vehicleType={data.vehicleType} 
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
            Selecione o tipo de veículo acima para continuar
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typeContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  typeTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  typeScroll: {
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  typeLabel: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
