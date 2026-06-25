import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PecaeGlassCard, PecaeImage } from '../PecaeUI';
import { usePecaeTheme } from '../../theme';
import { PecaeTokens } from '../../theme/pecae-tokens';

interface AnalyticsListingCardProps {
  title: string;
  views: number;
  chats?: number;
  rank: number;
}

export const AnalyticsListingCard: React.FC<AnalyticsListingCardProps> = ({ title, views, chats = 0, rank }) => {
  const { colors } = usePecaeTheme();

  return (
    <PecaeGlassCard style={styles.card} padding="sm" variant="subtle">
      <View style={styles.row}>
        <View style={styles.rankBadge}>
          <Text style={[styles.rankText, { fontFamily: PecaeTokens.typography.display }]}>#{rank}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary, fontFamily: PecaeTokens.typography.heading }]}>
            {title}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted, fontFamily: PecaeTokens.typography.body }]}>
                {views.toLocaleString('pt-BR')} views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted, fontFamily: PecaeTokens.typography.body }]}>
                {chats.toLocaleString('pt-BR')} contatos
              </Text>
            </View>
          </View>
        </View>
      </View>
    </PecaeGlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});
