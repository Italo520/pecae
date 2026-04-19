import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useForgeTheme } from '../../src/theme';
import { useBuyerProfile, useUpdateNotificationPreferences } from '../../src/hooks/useBuyer';

export default function Configuracoes() {
  const { colors, typography, glassmorphism } = useForgeTheme();
  
  const { data: profile, isLoading } = useBuyerProfile();
  const updatePrefsMutation = useUpdateNotificationPreferences();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(false);

  useEffect(() => {
    if (profile?.notificationPreferences) {
      setPushEnabled(profile.notificationPreferences.push ?? false);
      setEmailEnabled(profile.notificationPreferences.email ?? false);
      setInAppEnabled(profile.notificationPreferences.inApp ?? false);
    }
  }, [profile]);

  const handleTogglePush = async (value: boolean) => {
    try {
      if (value) {
        // Request OS permission if trying to enable push
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Atenção', 'Você precisa habilitar notificações nas configurações do sistema para receber alertas push.');
          setPushEnabled(false);
          return;
        }
      }

      setPushEnabled(value);
      await updatePrefsMutation.mutateAsync({ push: value });
    } catch (error) {
      setPushEnabled(!value); // revert
      Alert.alert('Erro', 'Não foi possível atualizar a preferência.');
    }
  };

  const handleToggleEmail = async (value: boolean) => {
    try {
      setEmailEnabled(value);
      await updatePrefsMutation.mutateAsync({ email: value });
    } catch (error) {
      setEmailEnabled(!value);
      Alert.alert('Erro', 'Não foi possível atualizar a preferência.');
    }
  };

  const handleToggleInApp = async (value: boolean) => {
    try {
      setInAppEnabled(value);
      await updatePrefsMutation.mutateAsync({ inApp: value });
    } catch (error) {
      setInAppEnabled(!value);
      Alert.alert('Erro', 'Não foi possível atualizar a preferência.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]}>
        <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]} edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.primary }]}>
          NOTIFICAÇÕES
        </Text>
        
        <View style={[styles.card, glassmorphism.panel, { borderColor: colors.border }]}>
          
          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text, fontFamily: typography.primary }]}>Notificações Push</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.secondary }]}>
                Receba alertas no seu celular mesmo com o app fechado
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.surface, true: colors.brand }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : (pushEnabled ? '#fff' : '#f4f3f4')}
              onValueChange={handleTogglePush}
              value={pushEnabled}
              disabled={updatePrefsMutation.isPending}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text, fontFamily: typography.primary }]}>E-mail</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.secondary }]}>
                Receba resumos e ofertas importantes por e-mail
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.surface, true: colors.brand }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : (emailEnabled ? '#fff' : '#f4f3f4')}
              onValueChange={handleToggleEmail}
              value={emailEnabled}
              disabled={updatePrefsMutation.isPending}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text, fontFamily: typography.primary }]}>In-App</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.secondary }]}>
                Receba alertas dentro do app (mensagens, atualizações)
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.surface, true: colors.brand }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : (inAppEnabled ? '#fff' : '#f4f3f4')}
              onValueChange={handleToggleInApp}
              value={inAppEnabled}
              disabled={updatePrefsMutation.isPending}
            />
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
