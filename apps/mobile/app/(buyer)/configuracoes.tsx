import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { usePecaeTheme } from '../../src/theme';
import { useBuyerProfile, useUpdateNotificationPreferences } from '../../src/hooks/useBuyer';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';

export default function Configuracoes() {
  const { colors, typography } = usePecaeTheme();
  
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
      setPushEnabled(!value);
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
          
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
            NOTIFICAÇÕES
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>Notificações Push</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
                  Receba alertas no seu celular mesmo com o app fechado
                </Text>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor={'#fff'}
                onValueChange={handleTogglePush}
                value={pushEnabled}
                disabled={updatePrefsMutation.isPending}
              />
            </View>

            <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>E-mail</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
                  Receba resumos e ofertas importantes por e-mail
                </Text>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor={'#fff'}
                onValueChange={handleToggleEmail}
                value={emailEnabled}
                disabled={updatePrefsMutation.isPending}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.heading }]}>In-App</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
                  Receba alertas dentro do app (mensagens, atualizações)
                </Text>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor={'#fff'}
                onValueChange={handleToggleInApp}
                value={inAppEnabled}
                disabled={updatePrefsMutation.isPending}
              />
            </View>

          </View>

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
