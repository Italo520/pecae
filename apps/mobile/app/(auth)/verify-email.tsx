import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';

export default function VerifyEmailScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (token.length !== 64) {
      Alert.alert('Erro', 'O código de verificação deve ter 64 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { token });
      Alert.alert('Sucesso', 'E-mail verificado com sucesso! Agora você pode fazer o login.', [
        { text: 'Ir para Login', onPress: () => router.push('/(auth)/login') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao verificar e-mail';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um link de ativação para o seu e-mail. 
          Insira o código recebido abaixo ou clique no link do e-mail.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Insira o código de 64 caracteres"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => Alert.alert('Aviso', 'Funcionalidade de reenvio em breve.')}
        >
          <Text style={styles.resendText}>Não recebeu o código? Reenviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    color: '#007bff',
    fontSize: 14,
  },
});
