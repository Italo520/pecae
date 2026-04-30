import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../src/theme';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';

export default function CentralSeguranca() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();

  // Mocks de Acessos
  const conexoesLog = [
    {
      id: '1',
      dispositivo: 'iPhone 15 Pro Max',
      localizacao: 'São Paulo, Brasil',
      dataHora: 'Hoje, 14:32',
    },
    {
      id: '2',
      dispositivo: 'MacBook Air (Chrome)',
      localizacao: 'Rio de Janeiro, Brasil',
      dataHora: '25 Abr 2026, 09:15',
    },
  ];

  return (
    <PecaeBackground>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* Nível de Segurança */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.brand, fontFamily: typography.display }]}>
            NÍVEL DE SEGURANÇA
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: '#22c55e', width: '85%' }]} />
            </View>
            <Text style={[styles.progressText, { color: '#22c55e', fontFamily: typography.mono }]}>
              85% (FORTE)
            </Text>
          </View>
          <Text style={[styles.desc, { color: colors.textMuted, fontFamily: typography.body }]}>
            Sua conta está altamente protegida. Adicione a autenticação de 2 fatores para atingir 100%.
          </Text>
        </View>

        {/* Selo de Verificação */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark" size={24} color={colors.brand} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display, marginLeft: 8 }]}>
              SELO DE VERIFICAÇÃO
            </Text>
          </View>
          <Text style={[styles.desc, { color: colors.textMuted, fontFamily: typography.body, marginTop: 10 }]}>
            Perfil verificado aumenta as chances de sucesso em negociações legítimas.
          </Text>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.brand }]}>
            <Text style={[styles.actionBtnText, { color: colors.brand, fontFamily: typography.medium }]}>
              Configurar Identidade
            </Text>
          </TouchableOpacity>
        </View>

        {/* Métodos de Acesso */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            MÉTODOS DE ACESSO
          </Text>
          
          <TouchableOpacity style={styles.methodRow}>
            <Ionicons name="finger-print-outline" size={20} color={colors.textPrimary} />
            <Text style={[styles.methodText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Biometria / FaceID
            </Text>
            <Text style={[styles.badgeActive, { color: '#22c55e', fontFamily: typography.mono }]}>ATIVADO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodRow}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />
            <Text style={[styles.methodText, { color: colors.textPrimary, fontFamily: typography.body }]}>
              Verificação via SMS
            </Text>
            <Text style={[styles.badgeActive, { color: colors.textMuted, fontFamily: typography.mono }]}>DESATIVADO</Text>
          </TouchableOpacity>
        </View>

        {/* Histórico de Conexões */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            HISTÓRICO DE CONEXÕES
          </Text>
          
          {conexoesLog.map((log) => (
            <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.logDevice, { color: colors.textPrimary, fontFamily: typography.body }]}>
                  {log.dispositivo}
                </Text>
                <Text style={[styles.logInfo, { color: colors.textMuted, fontFamily: typography.body }]}>
                  {log.localizacao} • {log.dataHora}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            </View>
          ))}
        </View>

      </ScrollView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  methodText: {
    flex: 1,
    fontSize: 14,
  },
  badgeActive: {
    fontSize: 11,
    fontWeight: '700',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logDevice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logInfo: {
    fontSize: 11,
    marginTop: 2,
  },
});
