import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ForgeBackground } from '@/src/components/ForgeUI/ForgeBackground';
import { ForgeGlassCard } from '@/src/components/ForgeUI/ForgeGlassCard';
import { ForgeButton } from '@/src/components/ForgeUI/ForgeButton';
import { useForgeTheme } from '@/src/theme';
import { api } from '@/src/services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VerificationRequestScreen() {
  const { colors } = useForgeTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDocs, setSelectedDocs] = useState<{ id: string, uri: string, name: string, type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['verification-status'],
    queryFn: async () => {
      const response = await api.get('/sellers/verification/status');
      return response.data;
    },
  });

  const pickDocument = async () => {
    if (selectedDocs.length >= 5) {
      Alert.alert('Limite atingido', 'Você pode enviar no máximo 5 documentos.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: false,
      });

      if (!result.canceled) {
        const doc = result.assets[0];
        setSelectedDocs([...selectedDocs, {
          id: Math.random().toString(),
          uri: doc.uri,
          name: doc.name,
          type: doc.mimeType || 'application/octet-stream',
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const takePhoto = async () => {
    if (selectedDocs.length >= 5) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar a foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      const photo = result.assets[0];
      setSelectedDocs([...selectedDocs, {
        id: Math.random().toString(),
        uri: photo.uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      }]);
    }
  };

  const removeDoc = (id: string) => {
    setSelectedDocs(selectedDocs.filter(d => d.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedDocs.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um documento.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Solicita URLs assinadas
      const { data: slots } = await api.post('/sellers/verification/request');

      // 2. Upload paralelo para o Storage
      const uploadResults = await Promise.all(
        selectedDocs.map(async (doc, index) => {
          const slot = slots[index];
          const response = await fetch(doc.uri);
          const blob = await response.blob();

          await fetch(slot.uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': doc.type,
            },
          });

          return slot.path; // Enviamos o path para o backend confirmar
        })
      );

      // 3. Confirma a solicitação na API
      await api.post('/sellers/verification/confirm', {
        documentUrls: uploadResults,
      });

      Alert.alert('Sucesso', 'Sua solicitação foi enviada e será analisada em até 48h.');
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
      queryClient.invalidateQueries({ queryKey: ['seller-me'] });
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um problema ao enviar seus documentos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <ForgeBackground>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </ForgeBackground>
    );
  }

  const latest = status?.latestVerification;

  if (latest?.status === 'PENDING') {
    return (
      <ForgeBackground>
        <View style={styles.statusContainer}>
          <Ionicons name="time-outline" size={80} color="#F59E0B" />
          <Text style={styles.statusTitle}>Verificação em Análise</Text>
          <Text style={styles.statusSub}>
            Nossa equipe está revisando seus documentos. Você será notificado assim que o processo for concluído.
          </Text>
          <ForgeButton title="VOLTAR" onPress={() => router.back()} variant="outline" />
        </View>
      </ForgeBackground>
    );
  }

  return (
    <ForgeBackground>
      <Stack.Screen options={{ title: 'Solicitar Verificação', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Selo de Verificado</Text>
        <Text style={styles.subtitle}>
          Vendedores verificados têm maior destaque nas buscas e passam mais confiança aos compradores na Forja.
        </Text>

        <ForgeGlassCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Documentos Necessários</Text>
          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
            <Text style={styles.listText}>Documento de Identidade (RG/CNH)</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
            <Text style={styles.listText}>Comprovante de CNPJ (se PJ)</Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
            <Text style={styles.listText}>Selfie segurando o documento</Text>
          </View>
        </ForgeGlassCard>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Seus Documentos ({selectedDocs.length}/5)</Text>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity onPress={pickDocument} style={styles.uploadBtn}>
              <Ionicons name="document-attach-outline" size={24} color={colors.brand} />
              <Text style={styles.uploadBtnText}>ARQUIVO</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto} style={styles.uploadBtn}>
              <Ionicons name="camera-outline" size={24} color={colors.brand} />
              <Text style={styles.uploadBtnText}>CÂMERA</Text>
            </TouchableOpacity>
          </View>

          {selectedDocs.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <Ionicons name={doc.type.includes('image') ? 'image-outline' : 'document-outline'} size={20} color="#94A3B8" />
              <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
              <TouchableOpacity onPress={() => removeDoc(doc.id)}>
                <Ionicons name="close-circle" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <ForgeButton 
            title={isUploading ? 'ENVIANDO...' : 'ENVIAR PARA ANÁLISE'} 
            onPress={handleSubmit}
            loading={isUploading}
            disabled={selectedDocs.length === 0}
          />
        </View>
      </ScrollView>
    </ForgeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  infoCard: {
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginLeft: 10,
  },
  uploadSection: {
    marginBottom: 32,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadBtn: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  docName: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 12,
  },
  footer: {
    marginBottom: 60,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  statusTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusSub: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontSize: 15,
  }
});
