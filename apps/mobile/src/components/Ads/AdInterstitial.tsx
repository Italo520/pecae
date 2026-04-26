import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { api } from '../../services/api';

interface AdInterstitialProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

// Google AdMob Test ID for Interstitial
const ADMOB_TEST_ID = 'ca-app-pub-3940256099942544/1033173712';

export const AdInterstitial: React.FC<AdInterstitialProps> = ({ visible, userId, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [isCapped, setIsCapped] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && userId) {
      checkCapping();
    }
  }, [visible, userId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && !isCapped && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, isCapped, countdown]);

  const checkCapping = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ads/interstitial/status/${userId}`);
      setIsCapped(!response.data.allowed);
    } catch (error) {
      console.error('Failed to check interstitial capping:', error);
      // Fallback: allow ad if backend fails
      setIsCapped(false);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || loading || isCapped) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>Anúncio</Text>
              </View>
              {countdown > 0 ? (
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>Fechar em {countdown}s</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Feather name="x" size={24} color="#F1F3FC" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.content}>
              <View style={styles.glowContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' }}
                  style={styles.adImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.title}>PECAÊ Pro Max</Text>
              <Text style={styles.description}>
                Desbloqueie recursos avançados de análise, cotações automáticas e suporte prioritário.
              </Text>

              <TouchableOpacity style={styles.ctaButton} onPress={onClose}>
                <Text style={styles.ctaText}>Saiba Mais</Text>
                <Feather name="arrow-right" size={18} color="#0a0e14" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 20, 0.8)',
  },
  container: {
    width: width * 0.85,
    height: height * 0.7,
    backgroundColor: 'rgba(27, 32, 40, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(63, 255, 139, 0.15)',
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adBadge: {
    backgroundColor: 'rgba(63, 255, 139, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adBadgeText: {
    color: '#3fff8b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timerBadge: {
    backgroundColor: 'rgba(241, 243, 252, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timerText: {
    color: '#F1F3FC',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(241, 243, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  glowContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(63, 255, 139, 0.2)',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#F1F3FC',
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: '#A8ABB3',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  ctaButton: {
    backgroundColor: '#3fff8b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: '#0a0e14',
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
  },
});
