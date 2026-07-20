import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { usePecaeTheme } from '../../theme';
import { useDeviceLayout } from '../../hooks/useDeviceLayout';

import * as Linking from 'expo-linking';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
}

export function BannerCarousel({ onBannersLoaded }: { onBannersLoaded?: (hasBanners: boolean) => void }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = usePecaeTheme();
  const { isTablet, width } = useDeviceLayout();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/ads/serve/HOME_TOP');
        if (response.data && response.data.criativoId) {
          const ad = response.data;
          setBanners([{
            id: ad.criativoId,
            imageUrl: ad.urlImagem,
            linkUrl: ad.urlDestino,
            title: ad.titulo
          }]);
          onBannersLoaded?.(true);
        } else {
          onBannersLoaded?.(false);
        }
      } catch (error) {
        console.warn('Failed to load banners', error);
        onBannersLoaded?.(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [onBannersLoaded]);

  const handleBannerPress = async (banner: Banner) => {
    try {
      // Track click in the background
      api.post(`/ads/${banner.id}/click`).catch(() => {});
      
      if (banner.linkUrl) {
        await Linking.openURL(banner.linkUrl);
      }
    } catch (error) {
      console.warn('Failed to open banner link', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, isTablet && { marginHorizontal: 32 }, { backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const bannerHeight = isTablet ? 250 : 150;
  const screenWidth = width;

  // A largura máxima do banner deve ser a largura calculada para este container.
  const bannerWidth = isTablet ? width - 64 : screenWidth - 40;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: isTablet ? 32 : 20 }}
      >
        {banners.map((banner) => (
          <Pressable 
            key={banner.id} 
            style={({ pressed }) => [styles.bannerWrapper, { width: bannerWidth, height: bannerHeight }, pressed && { opacity: 0.7 }]}
            onPress={() => handleBannerPress(banner)}
          >
            <Image 
              source={{ uri: banner.imageUrl }} 
              style={styles.bannerImage} 
              resizeMode="cover" 
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    height: 150,
    marginHorizontal: 20,
    marginVertical: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});
