import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { usePecaeTheme } from '../../theme';
import { PecaeGlassCard } from '../PecaeUI/PecaeGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useVehicleActions } from '../../hooks/useVehicles';
import { useVehicleWizardStore } from '../../store/vehicle-wizard-store';
import { useRouter } from 'expo-router';

interface VehicleInventoryCardProps {
  vehicle: any;
}

export const VehicleInventoryCard: React.FC<VehicleInventoryCardProps> = ({ vehicle }) => {
  const { colors, typography } = usePecaeTheme();
  const { markAsSold } = useVehicleActions();
  const loadVehicle = useVehicleWizardStore(s => s.loadVehicle);
  const router = useRouter();

  const handleEdit = () => {
    loadVehicle(vehicle);
    router.push('/(seller)/cadastrar-sucata');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return colors.brand;
      case 'PENDING': return colors.warning || '#f1c40f';
      case 'SOLD': return colors.textMuted;
      case 'REJECTED': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'Ativo';
      case 'PENDING': return 'Em Revisão';
      case 'SOLD': return 'Vendido';
      case 'REJECTED': return 'Recusado';
      default: return status;
    }
  };

  const handleSold = () => {
    Alert.alert(
      'Confirmar Venda',
      'Deseja marcar este veículo como vendido? O anúncio será removido da busca pública.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => markAsSold.mutate(vehicle.id) 
        }
      ]
    );
  };

  return (
    <PecaeGlassCard intensity={15} style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={{ uri: vehicle.photos?.[0]?.url || 'https://via.placeholder.com/150' }} 
          style={styles.image} 
        />
        
        <View style={styles.info}>
          <View style={styles.statusRow}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(vehicle.listing?.status) }]}>
              <Text style={styles.badgeText}>{getStatusLabel(vehicle.listing?.status)}</Text>
            </View>
            <Text style={[styles.date, { color: colors.textMuted, fontFamily: typography.body }]}>
              {new Date(vehicle.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.bold }]} numberOfLines={1}>
            {vehicle.title}
          </Text>
          
          <Text style={[styles.details, { color: colors.textMuted, fontFamily: typography.body }]}>
            {vehicle.color} • {vehicle.city}/{vehicle.state}
          </Text>
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
          <Text style={[styles.actionText, { color: colors.textPrimary, fontFamily: typography.medium }]}>Editar</Text>
        </TouchableOpacity>

        {vehicle.listing?.status !== 'SOLD' && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleSold}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.brand} />
            <Text style={[styles.actionText, { color: colors.brand, fontFamily: typography.medium }]}>Vendido</Text>
          </TouchableOpacity>
        )}
      </View>
    </PecaeGlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    padding: 0,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 44,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
  },
});
