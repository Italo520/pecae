import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PecaeBackground, PecaeGlassCard } from '../../../src/components/PecaeUI';
import { usePecaeTheme } from '../../../src/theme';
import { useVehicleDetails } from '../../../src/hooks/useVehicles';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../../src/hooks/useChat';

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, effects } = usePecaeTheme();
  const { data: vehicle, isLoading: loadingVehicle } = useVehicleDetails(id!);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { createRoom } = useChat();
  const { getFavorites, toggleFavorite } = useFavorites();
  const [isStartingChat, setIsStartingChat] = useState(false);

  if (loadingVehicle) {
    return (
      <PecaeBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </PecaeBackground>
    );
  }

  if (!vehicle) {
    return (
      <PecaeBackground>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.textPrimary, fontFamily: typography.body }]}>
            Veículo não encontrado.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.brand }}>Voltar ao Catálogo</Text>
          </TouchableOpacity>
        </View>
      </PecaeBackground>
    );
  }

  const handleContact = async () => {
    if (isStartingChat) return;
    
    setIsStartingChat(true);
    try {
      const room = await createRoom.mutateAsync({ vehicleId: vehicle.id });
      router.push(`/chat/${room.id}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      const message = error.response?.data?.message || 'Não foi possível iniciar a negociação.';
      Alert.alert('Erro', message);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Helper to safely get display text from potentially nested objects
  const getDisplayText = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.name || val.yearFab?.toString() || val.yearModel?.toString() || '';
    }
    return String(val);
  };

  const normalizedBrand = getDisplayText(vehicle.brand);
  const normalizedModel = getDisplayText(vehicle.model);
  const normalizedVersion = getDisplayText(vehicle.version);
  const normalizedYear = typeof vehicle.yearFab === 'object' ? (vehicle.yearFab as any).yearFab?.toString() : String(vehicle.yearFab || '');

  const isWeb = width >= 768;

  const technicalSpecs = [
    { label: 'ANO', value: normalizedYear, icon: 'calendar-outline' },
    { label: 'COR', value: vehicle.color || 'Não informado', icon: 'color-palette-outline' },
    { label: 'ESTADO', value: 'Sucata', icon: 'construct-outline' },
    { label: 'ORIGEM', value: 'Doador', icon: 'business-outline' },
  ];

  return (
    <PecaeBackground>
      <Stack.Screen options={{ title: `${normalizedBrand} ${normalizedModel}`, headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentLayout, isWeb && styles.webLayout]}>
          
          {/* Header de Ação (Back) */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.floatingBack, { backgroundColor: 'rgba(10, 14, 20, 0.8)', borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Favorito (Heart) */}
          <TouchableOpacity 
            onPress={() => toggleFavorite.mutate(vehicle.id)} 
            style={[styles.floatingFavorite, { backgroundColor: 'rgba(10, 14, 20, 0.8)', borderColor: colors.border }]}
          >
            <Ionicons 
              name={getFavorites.data?.some((f: any) => f.id === vehicle.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={getFavorites.data?.some((f: any) => f.id === vehicle.id) ? colors.brand : colors.textPrimary} 
            />
          </TouchableOpacity>

          {/* Seção de Imagem / Galeria */}
          <View style={[styles.imageSection, isWeb && styles.webImageSection]}>
            <Image 
              source={{ uri: vehicle.thumbnail || 'https://via.placeholder.com/800x600?text=Sem+Foto' }} 
              style={[styles.mainImage, { borderRadius: isWeb ? effects.radius.lg : 0 }]} 
              resizeMode="cover"
            />
            {vehicle.seller?.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.brand }]}>
                <Ionicons name="checkmark-seal" size={14} color="#000" />
                <Text style={[styles.verifiedBadgeText, { fontFamily: typography.display, color: '#000' }]}>
                  VERIFICADO
                </Text>
              </View>
            )}
          </View>

          {/* Seção de Informações Detalhadas */}
          <View style={[styles.infoSection, isWeb && styles.webInfoSection]}>
            <View style={styles.mainInfo}>
              <Text style={[styles.brandText, { color: colors.brand, fontFamily: typography.display }]}>
                {normalizedBrand.toUpperCase() || 'VEÍCULO'}
              </Text>
              <Text style={[styles.modelText, { color: colors.textPrimary, fontFamily: typography.display }]}>
                {normalizedModel} {normalizedVersion}
              </Text>
              <Text style={[styles.priceText, { color: colors.brand, fontFamily: typography.display }]}>
                R$ {vehicle.availablePartsCount > 0 ? 'Sob Consulta' : '3.500,00'}
              </Text>
            </View>

            {/* Grid de Specs Técnicas */}
            <View style={styles.specsGrid}>
              {technicalSpecs.map((spec, index) => (
                <View key={index} style={[styles.specItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name={spec.icon as any} size={16} color={colors.textMuted} />
                  <View>
                    <Text style={[styles.specLabel, { color: colors.textMuted, fontFamily: typography.body }]}>{spec.label}</Text>
                    <Text style={[styles.specValue, { color: colors.textPrimary, fontFamily: typography.medium }]}>{spec.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Seção de Peças Disponíveis */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                PEÇAS DISPONÍVEIS
              </Text>
              <View style={styles.partsContainer}>
                {vehicle.availableParts && vehicle.availableParts.length > 0 ? (
                  vehicle.availableParts.map((part: string, index: number) => (
                    <View key={index} style={[styles.partBadge, { backgroundColor: colors.brand + '20', borderColor: colors.brand }]}>
                      <Text style={[styles.partText, { color: colors.brand, fontFamily: typography.medium }]}>
                        {part}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
                    Consulte o vendedor para lista completa de componentes.
                  </Text>
                )}
              </View>
            </View>

            {/* Descrição / Observações */}
            {vehicle.observations && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                  DESCRIÇÃO
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textMuted, fontFamily: typography.body }]}>
                  {vehicle.observations}
                </Text>
              </View>
            )}

            {/* Card do Vendedor */}
            <PecaeGlassCard intensity={15} style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { backgroundColor: colors.brand }]}>
                  <Text style={{ color: '#000', fontFamily: typography.display }}>{vehicle.seller?.storeName?.charAt(0) || 'V'}</Text>
                </View>
                <View>
                  <Text style={[styles.sellerName, { color: colors.textPrimary, fontFamily: typography.display }]}>
                    {vehicle.seller?.storeName || 'Vendedor'}
                  </Text>
                  <Text style={[styles.sellerLocation, { color: colors.textMuted, fontFamily: typography.body }]}>
                    📍 {vehicle.city}, {vehicle.state}
                  </Text>
                </View>
              </View>
            </PecaeGlassCard>

            {/* Botão de Contato */}
            <TouchableOpacity 
              onPress={handleContact} 
              disabled={isStartingChat}
              style={[
                styles.contactButton, 
                { backgroundColor: colors.brand, shadowColor: colors.brand },
                isStartingChat && { opacity: 0.7 }
              ]}
            >
              {isStartingChat ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="chatbubbles-outline" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={[styles.contactButtonText, { fontFamily: typography.display, color: '#000' }]}>
                    NEGOCIAR PEÇAS
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  floatingBack: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  floatingFavorite: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  contentLayout: {
    flexDirection: 'column',
  },
  webLayout: {
    flexDirection: 'row',
    padding: 20,
    gap: 40,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  imageSection: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  webImageSection: {
    flex: 1,
    height: 600,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  infoSection: {
    padding: 20,
    flex: 1,
  },
  webInfoSection: {
    padding: 0,
  },
  mainInfo: {
    marginBottom: 24,
  },
  brandText: {
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 4,
  },
  modelText: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 24,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  specLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  specValue: {
    fontSize: 13,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 16,
  },
  partsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  partText: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  sellerCard: {
    padding: 16,
    marginBottom: 32,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
  },
  sellerLocation: {
    fontSize: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    fontSize: 14,
    letterSpacing: 1,
  },
});
