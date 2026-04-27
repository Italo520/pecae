import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../src/theme';

export default function MinhasCompras() {
  const { colors, typography, spacing } = usePecaeTheme();
  const router = useRouter();

  // Mocks de Compras Realizadas
  const comprasMock = [
    {
      id: '1',
      veiculo: 'Honda Civic Touring 2021',
      data: '24 Abr 2026',
      valor: 'R$ 132.900,00',
      status: 'Concluída',
      vendedor: 'AutoParts Premium',
      img: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=400&q=80',
    },
    {
      id: '2',
      veiculo: 'Motor Completo AP 1.8 Turbo',
      data: '15 Mar 2026',
      valor: 'R$ 7.850,00',
      status: 'Concluída',
      vendedor: 'Desmanche do Alemão',
      img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&q=80',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
          MINHAS COMPRAS
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {comprasMock.map((compra) => (
          <View 
            key={compra.id} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Image source={{ uri: compra.img }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={[styles.veiculoTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                {compra.veiculo}
              </Text>
              <Text style={[styles.infoText, { color: colors.textMuted, fontFamily: typography.body }]}>
                Vendedor: {compra.vendedor}
              </Text>
              <Text style={[styles.infoText, { color: colors.textMuted, fontFamily: typography.body }]}>
                Data: {compra.data}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.price, { color: colors.brand, fontFamily: typography.mono }]}>
                  {compra.valor}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e' }]}>
                  <Text style={[styles.statusText, { color: '#22c55e', fontFamily: typography.mono }]}>
                    {compra.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        {comprasMock.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
              Você ainda não realizou compras.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    gap: 12,
    overflow: 'hidden',
  },
  cardImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  veiculoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
