import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { VehicleSelector } from '../../src/components/Catalog';
import { PecaeScreenContainer } from '../../src/components/PecaeUI/PecaeScreenContainer';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';
import { usePecaeTheme } from '../../src/theme';

export default function CatalogScreen() {
  const { colors } = usePecaeTheme();

  const handleSelect = (selection: any) => {
    Alert.alert(
      'Veículo Selecionado',
      `${selection.brand.name} ${selection.model.name}\n${selection.version.name}\nAno: ${selection.year.year}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <PecaeBackground>
      <PecaeScreenContainer>
        <Stack.Screen 
          options={{ 
            title: 'Catálogo',
            headerShown: false 
          }} 
        />
        <View style={styles.container}>
          <VehicleSelector onSelect={handleSelect} />
        </View>
      </PecaeScreenContainer>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // Space for status bar if not handled by container
  },
});
