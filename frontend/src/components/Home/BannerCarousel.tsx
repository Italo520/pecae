import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = usePecaeTheme();
  const { isDesktop, width } = useDeviceLayout();

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
        }
      } catch (error) {
        console.warn('Failed to load banners', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

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
      <View style={[styles.loadingContainer, isDesktop && { marginHorizontal: 0 }, { backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const bannerHeight = isDesktop ? 300 : 150;
  // Account for browser scrollbar on web
  const scrollbarWidth = Platform.OS === 'web' ? 16 : 0;
  const screenWidth = width - scrollbarWidth;

  // No desktop, o PageContainer limita a área útil a 1200px com 32px de padding em cada lado (total de 64px de recuo).
  // A largura máxima do banner deve ser a largura calculada para este container.
  const bannerWidth = isDesktop ? Math.min(screenWidth, 1200) - 64 : screenWidth - 40;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: isDesktop ? 0 : 20 }}
      >
        {banners.map((banner) => (
          <TouchableOpacity 
            key={banner.id} 
            activeOpacity={0.9} 
            style={[styles.bannerWrapper, { width: bannerWidth, height: bannerHeight }]}
            onPress={() => handleBannerPress(banner)}
          >
            <Image 
              source={{ uri: banner.imageUrl }} 
              style={styles.bannerImage} 
              resizeMode="cover" 
            />
          </TouchableOpacity>
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
