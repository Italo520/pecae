import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
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

export const Step3Photos: React.FC = () => {
  const { colors, typography } = usePecaeTheme();
  const { data, updateData, nextStep, prevStep, isStepValid } = useVehicleWizardStore();

  const pickImage = async () => {
    if (data.photos.length >= 12) {
      Alert.alert('Limite Atingido', 'Você pode adicionar no máximo 12 fotos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Precisamos de acesso às suas fotos para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newPhoto = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      };
      
      const newPhotos = [...data.photos, newPhoto];
      const updatePayload: any = { photos: newPhotos };
      
      // If it's the first photo, set as cover by default
      if (!data.coverPhotoUri) {
        updatePayload.coverPhotoUri = asset.uri;
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

  const isValid = isStepValid(3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.instruction, { color: colors.textMuted, fontFamily: typography.body }]}>
        Adicione entre 3 e 12 fotos. Toque na estrela para definir a capa.
      </Text>

      <View style={styles.grid}>
        {data.photos.map((photo, index) => {
          const isCover = photo.uri === data.coverPhotoUri;
          return (
            <View key={photo.uri + index} style={styles.slotWrapper}>
              <PecaeGlassCard intensity={isCover ? 30 : 10} style={[styles.photoSlot, isCover && { borderColor: colors.primary, borderWidth: 2 }]}>
                <Image source={{ uri: photo.uri }} style={styles.image} />
                
                <TouchableOpacity 
                  style={styles.removeBtn} 
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.coverBtn, isCover && { backgroundColor: colors.primary }]} 
                  onPress={() => setAsCover(photo.uri)}
                >
                  <Ionicons name={isCover ? "star" : "star-outline"} size={16} color="white" />
                </TouchableOpacity>

                {isCover && (
                  <View style={[styles.coverLabel, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>CAPA</Text>
                  </View>
                )}
              </PecaeGlassCard>
            </View>
          );
        })}

        {data.photos.length < 12 && (
          <TouchableOpacity style={styles.slotWrapper} onPress={pickImage}>
            <PecaeGlassCard intensity={5} style={[styles.photoSlot, styles.addBtn]}>
              <Ionicons name="add" size={40} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Adicionar</Text>
            </PecaeGlassCard>
          </TouchableOpacity>
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
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
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
    borderColor: 'rgba(255,255,255,0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 10,
    padding: 2,
  },
  coverBtn: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  coverLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
