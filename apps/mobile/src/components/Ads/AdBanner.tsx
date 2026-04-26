import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner';
}

// Google AdMob Test ID for Banner
const ADMOB_TEST_ID = 'ca-app-pub-3940256099942544/6300978111';

export const AdBanner: React.FC<AdBannerProps> = ({ size = 'banner' }) => {
  const handlePress = () => {
    // In a real AdMob integration, this is handled by the SDK.
    // For our simulated environment, we can open a useful link or do nothing.
    Linking.openURL('https://pecae.com.br');
  };

  const height = size === 'banner' ? 60 : 100;

  return (
    <View style={[styles.container, { height }]}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.8}>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>PECAÊ Premium</Text>
            <Text style={styles.subtitle}>Encontre as melhores peças com garantia e segurança.</Text>
          </View>
          <Feather name="external-link" size={16} color="#3fff8b" style={styles.icon} />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(63, 255, 139, 0.15)',
    backgroundColor: 'rgba(27, 32, 40, 0.6)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  adBadge: {
    backgroundColor: 'rgba(63, 255, 139, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  adBadgeText: {
    color: '#3fff8b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#F1F3FC',
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
  },
  subtitle: {
    color: '#A8ABB3',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  icon: {
    marginLeft: 8,
  },
});
