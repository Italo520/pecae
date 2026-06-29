import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { useRouter } from 'expo-router';

// Imagem de fallback confiável para quando a URL principal falha
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80';

export interface VehicleCardProps {
  id: string;
  brand?: string;
  model?: string;
  version?: string;
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
  brand,
  model,
  version,
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
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/vehicle/${id}`);
    }
  };

  const isList = variant === 'list';

  const formatMileage = (mil?: string | number) => {
    if (!mil) return '--';
    return `${Number(mil).toLocaleString('pt-BR')} km`;
  };

  const formatLocation = () => {
    if (!city && !state) return 'Local não info.';
    if (city && state) return `${city} - ${state}`;
    return city || state;
  };

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
        {/* Skeleton de carregamento enquanto a imagem não aparece */}
        {isImgLoading && (
          <View
            style={[
              styles.imgSkeleton,
              isList && styles.imageContainerList,
              { backgroundColor: colors.surface },
            ]}
          />
        )}
        <Image
          source={{ uri: imgError ? FALLBACK_IMAGE : (imageUrl || FALLBACK_IMAGE) }}
          style={[styles.image, isImgLoading && styles.imageHidden]}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          onLoad={() => setIsImgLoading(false)}
          onError={() => {
            setImgError(true);
            setIsImgLoading(false);
          }}
        />
        {isSponsored && (
          <View style={[styles.badge, { backgroundColor: colors.brand }]}>
            <Text style={[styles.badgeText, { color: '#000', fontFamily: typography.display }]}>
              PATROCINADO
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, isList && styles.infoContainerList]}>
        {/* Header de Texto */}
        <View style={styles.textHeader}>
          {brand && (
            <Text style={[styles.brandText, { color: colors.textMuted, fontFamily: typography.medium }]} numberOfLines={1}>
              {brand.toUpperCase()}
            </Text>
          )}
          <Text style={styles.titleWrapper} numberOfLines={2}>
            {model && <Text style={[styles.modelText, { color: colors.textPrimary, fontFamily: typography.display }]}>{model} </Text>}
            {version && <Text style={[styles.versionText, { color: colors.textMuted, fontFamily: typography.body }]}>{version}</Text>}
            {(!model && !version) && <Text style={[styles.modelText, { color: colors.textPrimary, fontFamily: typography.display }]}>Veículo sem título</Text>}
          </Text>
        </View>

        {/* Grid 2x2 de Especificações */}
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textPrimary, fontFamily: typography.body }]} numberOfLines={1}>
              {year || '--'}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textPrimary, fontFamily: typography.body }]} numberOfLines={1}>
              {formatMileage(mileage)}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="color-fill-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textPrimary, fontFamily: typography.body }]} numberOfLines={1}>
              {fuel || '--'}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textPrimary, fontFamily: typography.body }]} numberOfLines={1}>
              {formatLocation()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
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
    backgroundColor: '#F3F4F6',
  },
  imageContainerList: {
    width: 140,
    height: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imgSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: 4 / 3,
    opacity: 0.5,
  },
  imageHidden: {
    opacity: 0,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 16,
    paddingTop: 12,
  },
  infoContainerList: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  textHeader: {
    marginBottom: 16,
    height: 48,
  },
  brandText: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modelText: {
    fontSize: 15,
  },
  versionText: {
    fontSize: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 8,
  },
  specItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    flex: 1,
  },
});
