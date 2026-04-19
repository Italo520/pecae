import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function ExcluirContaScreen() {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();

  const handleDelete = () => {
    if (!password || password.trim() === '') {
      Alert.alert('Atenção', 'Você precisa informar sua senha atual para excluir a conta.');
      return;
    }

    Alert.alert(
      'Aviso Irreversível',
      'Sua conta será apagada. Por motivos legais, seus dados ficarão retidos por 30 dias antes de serem permanentemente anonimizados, mas seu acesso será imediatamente revogado. Deseja mesmo continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Conta',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/buyers/me', {
        data: { currentPassword: password },
      });
      
      Alert.alert(
        'Conta Excluída',
        'Sua conta foi agendada para exclusão e você foi desconectado.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await signOut();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Erro ao tentar excluir a conta.';
      Alert.alert('Erro', message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{ 
          title: 'Excluir Conta',
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Feather name="alert-triangle" size={32} color="#DC2626" />
          <Text style={styles.warningTitle}>Zona de Perigo</Text>
          <Text style={styles.warningText}>
            A exclusão da conta resultará na revogação imediata do acesso. 
            Todas as suas configurações, buscas salvas e favoritos serão apagados.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Senha Atual</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isDeleting}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Excluir Minha Conta</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isDeleting}
        >
          <Text style={styles.cancelButtonText}>Voltar em Segurança</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: '#F87171',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
});
