import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePecaeTheme } from '../../theme';

export function AppFooter() {
  const { colors, typography } = usePecaeTheme();

  return (
    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.container}>
        <View style={styles.brandContainer}>
          <View style={[styles.logoIcon, { backgroundColor: colors.brand }]} />
          <Text style={[styles.logoText, { color: colors.textPrimary, fontFamily: typography.display }]}>PEÇAÊ</Text>
        </View>
        <Text style={[styles.copy, { color: colors.textMuted, fontFamily: typography.body }]}>
          © {new Date().getFullYear()} Peçaê. Todos os direitos reservados. O maior marketplace de doadores automotivos.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 40,
    borderTopWidth: 1,
    marginTop: 'auto',
  },
  container: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    transform: [{ rotate: '15deg' }],
  },
  logoText: {
    fontSize: 16,
    letterSpacing: 1,
  },
  copy: {
    fontSize: 14,
  },
});
