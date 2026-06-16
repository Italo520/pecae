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
        const response = await api.get('/banners');
        if (response.data && response.data.length > 0) {
          setBanners(response.data);
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
      api.post(`/banners/${banner.id}/click`).catch(() => {});
      
      if (banner.linkUrl) {
        await Linking.openURL(banner.linkUrl);
      }
    } catch (error) {
      console.warn('Failed to open banner link', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const bannerHeight = isDesktop ? 300 : 150;
  const bannerWidth = isDesktop ? 1200 : width - 40;

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
