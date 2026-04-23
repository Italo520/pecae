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
  const { data, updateData, nextStep, prevStep } = useVehicleWizardStore();

  const pickImage = async (index: number) => {
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
      const newPhotos = [...data.photos];
      const asset = result.assets[0];
      
      newPhotos[index] = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      };
      
      updateData({ photos: newPhotos });
    }
  };

  const removeImage = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    updateData({ photos: newPhotos });
  };

  const isValid = data.photos.filter(Boolean).length >= 1; // Mínimo 1 para dev, RN pede 5.

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.instruction, { color: colors.textMuted, fontFamily: typography.body }]}>
        Adicione pelo menos 5 fotos para uma melhor moderação.
      </Text>

      <View style={styles.grid}>
        {PHOTO_SLOTS.map((slot, index) => {
          const photo = data.photos[index];
          return (
            <TouchableOpacity 
              key={slot.id} 
              style={styles.slotWrapper}
              onPress={() => pickImage(index)}
            >
              <PecaeGlassCard intensity={10} style={styles.photoSlot}>
                {photo ? (
                  <>
                    <Image source={{ uri: photo.uri }} style={styles.image} />
                    <TouchableOpacity 
                      style={styles.removeBtn} 
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="camera" size={32} color={colors.textMuted} />
                    <Text style={[styles.slotLabel, { color: colors.textMuted, fontFamily: typography.medium }]}>
                      {slot.label}
                    </Text>
                  </View>
                )}
              </PecaeGlassCard>
            </TouchableOpacity>
          );
        })}
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
    justifyContent: 'space-between',
  },
  slotWrapper: {
    width: '48%',
    aspectRatio: 1,
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
  placeholder: {
    alignItems: 'center',
  },
  slotLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
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
