import React from 'react';
import { View, StyleSheet, Text, Pressable, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { PecaeGlassCard } from '../PecaeUI/PecaeGlassCard';
import { PecaeButton } from '../PecaeUI/PecaeButton';
import { useVehicleWizardStore } from '../../store/vehicle-wizard-store';

const PHOTO_SLOTS = [
  { id: 'front', label: 'Frente' },
  { id: 'rear', label: 'Traseira' },
  { id: 'left', label: 'Lateral Esq.' },
  { id: 'right', label: 'Lateral Dir.' },
  { id: 'interior', label: 'Interior/Motor' },
];

import { useToast } from '../../context/ToastContext';

export const Step3Photos: React.FC = () => {
  const { colors, typography } = usePecaeTheme();
  const { data, updateData, nextStep, prevStep, isStepValid } = useVehicleWizardStore();
  const { showToast } = useToast();

  const pickImage = async () => {
    if (data.photos.length >= 10) {
      showToast({ type: 'warning', title: 'Limite Atingido', message: 'Você pode adicionar no máximo 10 fotos.', duration: 3000 });
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showToast({ type: 'error', title: 'Permissão Negada', message: 'Precisamos de acesso às suas fotos para continuar.', duration: 4000 });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      let newPhotos = [...data.photos];

      for (const asset of result.assets) {
        if (newPhotos.length >= 10) break; // Maximum 10 photos
        const newPhoto = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
        };
        newPhotos.push(newPhoto);
      }
      
      const updatePayload: any = { photos: newPhotos };
      
      // If it's the first photo(s) added, set the first one as cover by default
      if (!data.coverPhotoUri && newPhotos.length > 0) {
        updatePayload.coverPhotoUri = newPhotos[0].uri;
      }

      updateData(updatePayload);
    }
  };

  const removeImage = (index: number) => {
    const photoToRemove = data.photos[index];
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    
    const updatePayload: any = { photos: newPhotos };
    
    // If we removed the cover photo, pick the next one as cover
    if (photoToRemove.uri === data.coverPhotoUri) {
      updatePayload.coverPhotoUri = newPhotos.length > 0 ? newPhotos[0].uri : undefined;
    }

    updateData(updatePayload);
  };

  const setAsCover = (uri: string) => {
    updateData({ coverPhotoUri: uri });
  };

  const moveImage = (index: number, direction: 'prev' | 'next') => {
    const newPhotos = [...data.photos];
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;
    
    // Swap elements
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    
    updateData({ photos: newPhotos });
  };

  const isValid = isStepValid(3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.instruction, { color: colors.textMuted, fontFamily: typography.body }]}>
        Adicione entre 4 e 10 fotos. Use as setas para ordenar e a estrela para definir a capa principal.
      </Text>

      <View style={styles.grid}>
        {data.photos.map((photo, index) => {
          const isCover = photo.uri === data.coverPhotoUri;
          return (
            <View key={photo.uri + index} style={styles.slotWrapper}>
              <PecaeGlassCard 
                intensity={isCover ? 35 : 10} 
                style={[
                  styles.photoSlot, 
                  isCover && { borderColor: colors.brand, borderWidth: 1.5 }
                ]}
              >
                <Image source={{ uri: photo.uri }} style={styles.image} />
                
                {/* Badge de Ordem */}
                <View style={[styles.orderBadge, isCover && { backgroundColor: colors.brand }]}>
                  <Text style={[styles.orderText, { color: isCover ? '#000' : '#fff', fontFamily: typography.bold }]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* Remover Foto */}
                <Pressable 
                  style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]} 
                  onPress={() => removeImage(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={14} color="white" />
                </Pressable>

                {/* Barra de Ações (Bottom) */}
                <View style={styles.actionRow}>
                  <Pressable 
                    style={({ pressed }) => [[styles.actionIconBtn, isCover && { backgroundColor: colors.brand , pressed && { opacity: 0.7 }]}]} 
                    onPress={() => setAsCover(photo.uri)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name={isCover ? "star" : "star-outline"} size={10} color={isCover ? '#000' : '#fff'} />
                  </Pressable>

                  <View style={{ flex: 1 }} />

                  {/* Mover para Trás */}
                  {index > 0 && (
                    <Pressable 
                      style={({ pressed }) => [styles.actionIconBtn, pressed && { opacity: 0.7 }]} 
                      onPress={() => moveImage(index, 'prev')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="chevron-back" size={11} color="white" />
                    </Pressable>
                  )}

                  {/* Mover para Frente */}
                  {index < data.photos.length - 1 && (
                    <Pressable 
                      style={({ pressed }) => [styles.actionIconBtn, pressed && { opacity: 0.7 }]} 
                      onPress={() => moveImage(index, 'next')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="chevron-forward" size={11} color="white" />
                    </Pressable>
                  )}
                </View>

                {isCover && (
                  <View style={[styles.coverLabel, { backgroundColor: colors.brand }]}>
                    <Text style={{ color: '#000', fontSize: 7, fontFamily: typography.bold }}>CAPA</Text>
                  </View>
                )}
              </PecaeGlassCard>
            </View>
          );
        })}

        {data.photos.length < 10 && (
          <Pressable style={({ pressed }) => [styles.slotWrapper, pressed && { opacity: 0.7 }]} onPress={pickImage}>
            <PecaeGlassCard intensity={5} style={[styles.photoSlot, styles.addBtn]}>
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: typography.bold, marginTop: 4 }}>Adicionar</Text>
            </PecaeGlassCard>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <PecaeButton
          title="Voltar"
          type="secondary"
          onPress={prevStep}
          style={styles.button}
        />
        <PecaeButton
          title="Próximo"
          onPress={nextStep}
          disabled={!isValid}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  slotWrapper: {
    width: '31%', // 3 per row
    aspectRatio: 1,
    marginHorizontal: '1%',
    marginBottom: 15,
  },
  photoSlot: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 12,
  },
  addBtn: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  orderBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  orderText: {
    fontSize: 8,
  },
  actionRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  actionIconBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 1,
  },
  coverLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 12,
    pointerEvents: 'none',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

