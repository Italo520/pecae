import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VehicleSelector } from '../Catalog/VehicleSelector';
import { useVehicleWizardStore } from '../../store/vehicle-wizard-store';

export const Step1VehicleSelection: React.FC = () => {
  const { updateData, nextStep } = useVehicleWizardStore();

  const handleSelect = (selection: any) => {
    updateData({
      brandId: selection.brand.id,
      modelId: selection.model.id,
      versionId: selection.version.id,
      yearFabId: selection.year.id,
    });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <VehicleSelector onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
