import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
// import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../src/services/api';
import { usePecaeTheme } from '../../src/theme';
import { PecaeTokens } from '../../src/theme/pecae-tokens';
import { PecaeScreenContainer, PecaeBackground } from '../../src/components/PecaeUI';
import { MetricCard } from '../../src/components/Analytics/MetricCard';
import { AnalyticsListingCard } from '../../src/components/Analytics/AnalyticsListingCard';

const { width } = Dimensions.get('window');

interface AnalyticsResponse {
  summary: {
    totalViews: number;
    activeListings: number;
    totalChats: number;
    periodDays: number;
  };
  viewsTimeline: { date: string; count: number }[];
  topListings: { id: string; title: string; views: number }[];
}

export default function AnalyticsScreen() {
  const { colors } = usePecaeTheme();
  const [periodIndex, setPeriodIndex] = useState(1); // 0: 7d, 1: 30d, 2: 90d
  const periods = [7, 30, 90];
  const periodDays = periods[periodIndex];

  const { data, isLoading, isError, refetch } = useQuery<AnalyticsResponse>({
    queryKey: ['sellerAnalytics', periodDays],
    queryFn: async () => {
      const response = await api.get(`/analytics/seller/me?periodDays=${periodDays}`);
      return response.data;
    },
  });

  const chartData = data?.viewsTimeline.map(item => {
    // Formata YYYY-MM-DD para DD/MM
    const dateObj = new Date(item.date);
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    return {
      value: item.count,
      label: `${day}/${month}`,
    };
  }) || [];

  const conversionRate = data && data.summary.totalViews > 0 
    ? ((data.summary.totalChats / data.summary.totalViews) * 100).toFixed(1) 
    : '0.0';

  return (
    <PecaeBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: PecaeTokens.typography.heading }]}>
              Performance
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: PecaeTokens.typography.body }]}>
              Acompanhe o engajamento dos seus anúncios
            </Text>
          </View>

          <View style={styles.segmentedWrapper}>
            {/* <SegmentedControl
              values={['7 Dias', '30 Dias', '90 Dias']}
              selectedIndex={periodIndex}
              onChange={(event) => {
                setPeriodIndex(event.nativeEvent.selectedSegmentIndex);
              }}
              tintColor={colors.brand}
              fontStyle={{ color: colors.textMuted }}
              activeFontStyle={{ color: '#fff', fontWeight: 'bold' }}
              backgroundColor={colors.surface}
            /> */}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          ) : isError ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: colors.danger }}>Erro ao carregar métricas.</Text>
            </View>
          ) : (
            <>
              <View style={styles.metricsGrid}>
                <View style={styles.metricsRow}>
                  <MetricCard 
                    icon="eye" 
                    label="Visualizações" 
                    value={data.summary.totalViews.toLocaleString('pt-BR')} 
                  />
                  <MetricCard 
                    icon="chatbubble-ellipses" 
                    label="Contatos Iniciados" 
                    value={data.summary.totalChats.toLocaleString('pt-BR')} 
                  />
                </View>
                <View style={styles.metricsRow}>
                  <MetricCard 
                    icon="analytics" 
                    label="Taxa de Conversão" 
                    value={`${conversionRate}%`} 
                  />
                  <MetricCard 
                    icon="car-sport" 
                    label="Anúncios Ativos" 
                    value={data.summary.activeListings} 
                  />
                </View>
              </View>

              <View style={styles.chartContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: PecaeTokens.typography.heading }]}>
                  Visualizações no Período
                </Text>
                {chartData.length > 0 ? (
                  <LineChart
                    data={chartData}
                    width={width - 64}
                    height={200}
                    color={colors.brand}
                    thickness={3}
                    dataPointsColor={colors.brand}
                    startFillColor={`${colors.brand}50`}
                    endFillColor={`${colors.brand}05`}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                    noOfSections={4}
                    spacing={Math.max((width - 64) / (chartData.length || 1), 30)}
                    rulesColor={`${colors.border}40`}
                    yAxisLabelSuffix=""
                    hideRules
                  />
                ) : (
                  <Text style={{ color: colors.textMuted, marginTop: 20 }}>Sem dados para o período.</Text>
                )}
              </View>

              <View style={styles.rankingContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: PecaeTokens.typography.heading }]}>
                  Top Anúncios
                </Text>
                {data.topListings.length > 0 ? (
                  data.topListings.map((listing, index) => (
                    <AnalyticsListingCard
                      key={listing.id}
                      title={listing.title}
                      views={listing.views}
                      rank={index + 1}
                    />
                  ))
                ) : (
                  <Text style={{ color: colors.textMuted }}>Nenhum anúncio com visualização ainda.</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  segmentedWrapper: {
    marginBottom: 20,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    gap: 8,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chartContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  rankingContainer: {
    marginBottom: 24,
  },
});
