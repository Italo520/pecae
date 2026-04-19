import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ForgeBackground } from '../../../src/components/ForgeUI';
import { useForgeTheme } from '../../../src/theme';

export default function SalesScreen() {
  const { colors } = useForgeTheme();
  return (
    <ForgeBackground>
      <View style={styles.container}>
        <Text style={{ color: colors.textPrimary }}>Histórico de Vendas</Text>
        <Text style={{ color: colors.textMuted }}>Em breve...</Text>
      </View>
    </ForgeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
