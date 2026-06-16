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

  const formattedPrice = price !== undefined && price !== null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
    : 'Sob consulta';

  const isList = variant === 'list';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        isList ? styles.containerList : styles.containerGrid,
        { backgroundColor: colors.surface, borderColor: isSponsored ? colors.brand : colors.border },
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
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.medium }]} numberOfLines={2}>
          {title}
        </Text>

        <Text style={[styles.price, { color: colors.textPrimary, fontFamily: typography.display }]} numberOfLines={1}>
          {formattedPrice}
        </Text>

        <View style={styles.detailsRow}>
          {year && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{year}</Text>}
          {year && mileage && <Text style={styles.dot}>•</Text>}
          {mileage && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{mileage} km</Text>}
          {(year || mileage) && fuel && <Text style={styles.dot}>•</Text>}
          {fuel && <Text style={[styles.detailText, { color: colors.textMuted, fontFamily: typography.body }]}>{fuel}</Text>}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={12} color={colors.textMuted} />
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
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
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
    backgroundColor: '#1A1A1A',
  },
  imageContainerList: {
    width: 120,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 12,
  },
  infoContainerList: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 18,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 12,
  },
  dot: {
    color: '#666',
    marginHorizontal: 4,
    fontSize: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    marginLeft: 4,
  },
});
