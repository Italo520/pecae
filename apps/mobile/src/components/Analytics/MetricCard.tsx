import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PecaeGlassCard } from '../PecaeUI';
import { usePecaeTheme } from '../../theme';
import { PecaeTokens } from '../../theme/pecae-tokens';

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, trend, trendValue }) => {
  const { colors } = usePecaeTheme();

  const getTrendColor = () => {
    if (trend === 'up') return colors.success;
    if (trend === 'down') return colors.danger;
    return colors.textMuted;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  return (
    <PecaeGlassCard style={styles.card} padding="md" variant="subtle">
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${colors.brand}15` }]}>
          <Ionicons name={icon} size={18} color={colors.brand} />
        </View>
        {trend && (
          <View style={styles.trendWrapper}>
            <Ionicons name={getTrendIcon()} size={12} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor(), fontFamily: PecaeTokens.typography.body }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: colors.textPrimary, fontFamily: PecaeTokens.typography.display }]}>
          {value}
        </Text>
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: PecaeTokens.typography.body }]}>
          {label}
        </Text>
      </View>
    </PecaeGlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
  },
});
