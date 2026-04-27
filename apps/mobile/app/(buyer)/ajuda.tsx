import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePecaeTheme } from '../../src/theme';

export default function MenuAjuda() {
  const { colors, typography } = usePecaeTheme();
  const router = useRouter();

  const faqs = [
    {
      pergunta: 'Como funciona a compra segura?',
      resposta: 'Todas as transações na plataforma PECAÊ passam por análise de segurança cadastral.',
    },
    {
      pergunta: 'Como entro em contato com o suporte?',
      resposta: 'Você pode enviar um e-mail para suporte@pecae.com.br ou usar o chat interno.',
    },
    {
      pergunta: 'Quais os prazos de entrega?',
      resposta: 'Os prazos dependem diretamente do vendedor e transportadora selecionada.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
          AJUDA & SUPORTE
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: typography.display }]}>
          PERGUNTAS FREQUENTES (FAQ)
        </Text>

        {faqs.map((faq, index) => (
          <View 
            key={index} 
            style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.faqQuestion, { color: colors.textPrimary, fontFamily: typography.display }]}>
              {faq.pergunta}
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.textMuted, fontFamily: typography.body }]}>
              {faq.resposta}
            </Text>
          </View>
        ))}

        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.brand }]}>
          <Ionicons name="mail-outline" size={32} color={colors.brand} />
          <Text style={[styles.contactTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
            AINDA PRECISA DE AJUDA?
          </Text>
          <Text style={[styles.contactDesc, { color: colors.textMuted, fontFamily: typography.body }]}>
            Nosso time de suporte está disponível 24h por dia.
          </Text>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.brand }]}>
            <Text style={[styles.contactBtnText, { fontFamily: typography.medium }]}>
              FALAR COM O SUPORTE
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 16,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 18,
  },
  contactCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 8,
  },
  contactDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  contactBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
});
