import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { usePecaeTheme } from '../../theme';
import { useDeviceLayout } from '../../hooks/useDeviceLayout';

interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
}
const MOCK_BANNERS: Banner[] = [
  {
    id: 'mock-1',
    imageUrl: 'https://images.unsplash.com/photo-1611078516086-fb22e8312e06?auto=format&fit=crop&w=1200&q=80',
    title: 'Peças Originais',
  },
  {
    id: 'mock-2',
    imageUrl: 'https://images.unsplash.com/photo-1625047509168-a71c6f71b9e0?auto=format&fit=crop&w=1200&q=80',
    title: 'Desconto em Pneus',
  },
  {
    id: 'mock-3',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    title: 'Acessórios Automotivos',
  }
];

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
        } else {
          setBanners(MOCK_BANNERS);
        }
      } catch (error) {
        console.warn('Failed to load banners, using mocks', error);
        setBanners(MOCK_BANNERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

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
            onPress={() => {
              if (banner.link) {
                // handle deep linking or navigation
              }
            }}
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
