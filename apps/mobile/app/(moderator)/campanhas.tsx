import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  PecaeBackground,
  PecaeGlassCard,
  PecaeButton,
  PecaeScreenContainer,
} from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import {
  useAllCampaigns,
  useCreateCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useCancelCampaign,
} from '../../src/hooks/useAds';
import { AdCampaign } from '../../src/services/ads';

const { width } = Dimensions.get('window');

export default function AdsCampaignScreen() {
  const { colors, typography } = usePecaeTheme();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    listingId: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const { data: campaigns = [], isLoading, refetch, isFetching } = useAllCampaigns();

  const createMutation = useCreateCampaign();
  const pauseMutation = usePauseCampaign();
  const resumeMutation = useResumeCampaign();
  const cancelMutation = useCancelCampaign();

  const handleCreateCampaign = () => {
    if (!newCampaign.listingId || !newCampaign.budget) {
      Alert.alert('Erro', 'Por favor, preencha o ID do anúncio e o orçamento.');
      return;
    }

    createMutation.mutate(
      {
        listingId: newCampaign.listingId,
        budget: parseFloat(newCampaign.budget),
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Campanha criada com sucesso!');
          setIsCreateModalVisible(false);
          setNewCampaign({
            listingId: '',
            budget: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
          });
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || 'Falha ao criar campanha.';
          Alert.alert('Erro', msg);
        },
      }
    );
  };

  const toggleCampaignStatus = (campaign: AdCampaign) => {
    if (campaign.status === 'ACTIVE') {
      pauseMutation.mutate(campaign.id, {
        onSuccess: () => Alert.alert('Sucesso', 'Campanha pausada.'),
        onError: (error: any) => Alert.alert('Erro', 'Falha ao pausar.'),
      });
    } else if (campaign.status === 'PAUSED') {
      resumeMutation.mutate(campaign.id, {
        onSuccess: () => Alert.alert('Sucesso', 'Campanha retomada.'),
        onError: (error: any) => Alert.alert('Erro', 'Falha ao retomar.'),
      });
    }
  };

  const handleCancelCampaign = (id: string) => {
    Alert.alert('Cancelar Campanha', 'Tem certeza que deseja cancelar esta campanha?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => {
          cancelMutation.mutate(id, {
            onSuccess: () => Alert.alert('Sucesso', 'Campanha cancelada.'),
            onError: () => Alert.alert('Erro', 'Falha ao cancelar.'),
          });
        },
      },
    ]);
  };

  const renderCampaignItem = ({ item }: { item: AdCampaign }) => {
    const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : '0.00';
    const statusColors = {
      ACTIVE: { text: '#3fff8b', bg: 'rgba(63, 255, 139, 0.1)' },
      PAUSED: { text: '#FFB938', bg: 'rgba(255, 185, 56, 0.1)' },
      CANCELLED: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    };

    const currentStatus = statusColors[item.status] || statusColors.CANCELLED;

    return (
      <PecaeGlassCard intensity={15} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleWrapper}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
              {item.listing?.title || 'Anúncio Patrocinado'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              ID: {item.id.slice(0, 8)}... | Listing: {item.listingId.slice(0, 8)}...
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
            <Text style={[styles.statusBadgeText, { color: currentStatus.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricBlock}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>IMPRESSÕES</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{item.impressions}</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>CLIQUES</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{item.clicks}</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>CTR</Text>
            <Text style={[styles.metricValue, { color: '#7ae6ff' }]}>{ctr}%</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.budgetText, { color: colors.textPrimary }]}>
            Orçamento: <Text style={{ color: colors.brand }}>R$ {item.budget.toFixed(2)}</Text>
          </Text>

          {item.status !== 'CANCELLED' && (
            <View style={styles.actionsGroup}>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: currentStatus.text }]}
                onPress={() => toggleCampaignStatus(item)}
              >
                <Feather
                  name={item.status === 'ACTIVE' ? 'pause' : 'play'}
                  size={16}
                  color={currentStatus.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: '#EF4444' }]}
                onPress={() => handleCancelCampaign(item.id)}
              >
                <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </PecaeGlassCard>
    );
  };

  return (
    <PecaeBackground>
      <PecaeScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
              CAMPANHAS ADS
            </Text>
            <Text style={[styles.subtitle, { color: colors.brand }]}>// GESTÃO_DE_PUBLICIDADE</Text>
          </View>

          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.brand }]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Feather name="plus" size={20} color="#0a0e14" />
            <Text style={styles.createBtnText}>Criar</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <Text style={{ color: colors.textPrimary }}>Carregando campanhas...</Text>
          </View>
        ) : (
          <FlatList
            data={campaigns}
            renderItem={renderCampaignItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.brand} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="layers" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 12 }}>Nenhuma campanha ativa.</Text>
              </View>
            }
          />
        )}

        {/* Modal para Criar Campanha */}
        <Modal visible={isCreateModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.display }]}>
                    NOVA CAMPANHA
                  </Text>
                  <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                    <Feather name="x" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>ID DO ANÚNCIO (LISTING)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Cole o UUID do anúncio"
                    placeholderTextColor={colors.textMuted}
                    value={newCampaign.listingId}
                    onChangeText={(text) => setNewCampaign({ ...newCampaign, listingId: text })}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>ORÇAMENTO (R$)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Ex: 500.00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={newCampaign.budget}
                    onChangeText={(text) => setNewCampaign({ ...newCampaign, budget: text })}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>DATA DE INÍCIO</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    value={newCampaign.startDate}
                    onChangeText={(text) => setNewCampaign({ ...newCampaign, startDate: text })}
                  />

                  <Text style={[styles.label, { color: colors.textMuted }]}>DATA DE TÉRMINO (OPCIONAL)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    value={newCampaign.endDate}
                    onChangeText={(text) => setNewCampaign({ ...newCampaign, endDate: text })}
                  />

                  <PecaeButton
                    title="LANÇAR CAMPANHA"
                    onPress={handleCreateCampaign}
                    loading={createMutation.isPending}
                    style={{ marginTop: 24, backgroundColor: colors.brand }}
                  />
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
      </PecaeScreenContainer>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 4,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createBtnText: {
    color: '#0a0e14',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleWrapper: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(241, 243, 252, 0.05)',
  },
  metricBlock: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 14,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0e14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(63, 255, 139, 0.15)',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    letterSpacing: 2,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
