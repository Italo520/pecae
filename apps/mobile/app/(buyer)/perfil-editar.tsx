import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { usePecaeTheme } from '../../src/theme';
import { useBuyerProfile, useUpdateBuyerProfile } from '../../src/hooks/useBuyer';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';

interface FormData {
  name: string;
}

export default function PerfilEditar() {
  const { colors, typography, spacing } = usePecaeTheme();
  const router = useRouter();
  
  const { data: profile, isLoading: isLoadingProfile } = useBuyerProfile();
  const updateProfileMutation = useUpdateBuyerProfile();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
    }
  });

  useEffect(() => {
    if (profile) {
      setValue('name', profile.name || '');
      if (profile.avatar) {
        setAvatarUri(profile.avatar);
      }
    }
  }, [profile, setValue]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para alterar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadToSupabase = async (uri: string): Promise<string> => {
    console.log('Simulating upload to Supabase storage...', uri);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(uri);
      }, 1000);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      let finalAvatarUrl = profile?.avatar;

      if (avatarUri && avatarUri !== profile?.avatar && avatarUri.startsWith('file://')) {
        finalAvatarUrl = await uploadToSupabase(avatarUri);
      }

      await updateProfileMutation.mutateAsync({
        name: data.name,
        avatarUrl: finalAvatarUrl,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <PecaeBackground>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 50 }} />
        </SafeAreaView>
      </PecaeBackground>
    );
  }

  return (
    <PecaeBackground>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.content}>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: colors.brand }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="person" size={40} color={colors.textMuted} />
                </View>
              )}
              <TouchableOpacity 
                style={[styles.changeAvatarBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickImage}
              >
                <Ionicons name="camera" size={20} color={colors.brand} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.avatarHint, { color: colors.textMuted, fontFamily: typography.body }]}>
              Toque no ícone para alterar a foto
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.display }]}>NOME COMPLETO</Text>
            <Controller
              control={control}
              rules={{
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'O nome deve ter no mínimo 2 caracteres' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.surface,
                      color: colors.textPrimary, 
                      borderColor: errors.name ? colors.error : colors.border, 
                      fontFamily: typography.body 
                    }
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textMuted}
                />
              )}
              name="name"
            />
            {errors.name && <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.body }]}>{errors.name.message}</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.brand },
              (updateProfileMutation.isPending || isUploading) && { opacity: 0.7 }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={updateProfileMutation.isPending || isUploading}
          >
            {updateProfileMutation.isPending || isUploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.saveButtonText, { fontFamily: typography.medium }]}>SALVAR ALTERAÇÕES</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 12,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
