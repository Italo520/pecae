import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { useRouter } from 'expo-router';

export interface VehicleCardProps {
  id: string;
  title: string;
  price?: number;
  year?: string | number;
  mileage?: string | number;
  fuel?: string;
  city?: string;
  state?: string;
  imageUrl?: string | null;
  isSponsored?: boolean;
  variant?: 'grid' | 'list';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  title,
  price,
  year,
  mileage,
  fuel,
  city,
  state,
  imageUrl,
  isSponsored = false,
  variant = 'grid',
  onPress,
  style,
}) => {
  const { colors, typography, effects } = usePecaeTheme();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/vehicle/${id}`);
    }
  };

  const isList = variant === 'list';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        isList ? styles.containerList : styles.containerGrid,
        { backgroundColor: colors.surface },
        isSponsored && { borderColor: colors.brand, borderWidth: 1 },
        style
      ]}
    >
      <View style={[styles.imageContainer, isList && styles.imageContainerList]}>
        <Image
          source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80' }}
          style={styles.image}
          resizeMode="cover"
        />
        {isSponsored && (
          <View style={[styles.sponsoredBadge, { backgroundColor: colors.brand }]}>
            <Text style={[styles.sponsoredText, { color: '#000', fontFamily: typography.display }]}>PATROCINADO</Text>
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, isList && styles.infoContainerList]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.body }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.detailsRow}>
          {year && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{year}</Text>}
          {year && mileage && <Text style={styles.dot}>•</Text>}
          {mileage && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{mileage} km</Text>}
          {(year || mileage) && fuel && <Text style={styles.dot}>•</Text>}
          {fuel && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{fuel}</Text>}
        </View>

        <View style={styles.locationRow}>
          <Text style={[styles.locationText, { color: colors.textMuted, fontFamily: typography.body }]} numberOfLines={1}>
            {city || 'Local'}{state ? ` - ${state}` : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
    // Usando boxShadow compatível com web e mobile (através das propriedades do React Native)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  containerGrid: {
    flexDirection: 'column',
  },
  containerList: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F3F4F6', // cinza bem claro para placeholder
  },
  imageContainerList: {
    width: 140,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 9,
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  infoContainerList: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 18,
    height: 36, // mantendo altura fixa para alinhar o layout do grid
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 12,
  },
  dot: {
    color: '#9CA3AF',
    marginHorizontal: 4,
    fontSize: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
  },
});
