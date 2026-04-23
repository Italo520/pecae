import React from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { PecaeBackground, PecaeButton } from '../../../src/components/PecaeUI';
import { usePecaeTheme } from '../../../src/theme';
import { useRouter } from 'expo-router';
import { useVehicles } from '../../../src/hooks/useVehicles';
import { VehicleInventoryCard } from '../../../src/components/VehicleWizard/VehicleInventoryCard';

export default function InventoryScreen() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();
  const { data: vehicles, isLoading, refetch } = useVehicles();

  return (
    <PecaeBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>
            Meu Inventário
          </Text>
          <PecaeButton 
            title="Cadastrar Sucata" 
            onPress={() => router.push('/(seller)/cadastrar-sucata')}
            style={styles.addButton}
          />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={({ item }) => <VehicleInventoryCard vehicle={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.brand} />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
                  Você ainda não possui veículos cadastrados.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Space for header
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 15,
  },
  addButton: {
    width: '100%',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
