import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PecaeBackground, PecaeGlassCard } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/store/auth-store';
import { Ionicons } from '@expo/vector-icons';

interface ChatRoom {
  id: string;
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  interlocutor: {
    name: string | null;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function MensagensScreen() {
  const { colors, typography, effects } = usePecaeTheme();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Falha ao carregar salas de chat:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    // Atualizar a cada 15 segundos para pegar novas mensagens / salas
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  const handleRoomPress = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const formattedDate = item.lastMessage
      ? new Date(item.lastMessage.createdAt).toLocaleDateString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity 
        onPress={() => handleRoomPress(item.id)}
        activeOpacity={0.8}
        style={styles.roomContainer}
      >
        <PecaeGlassCard intensity={15} style={[styles.card, { borderRadius: effects.radius.md }]}>
          <View style={styles.contentRow}>
            {/* Foto do Veículo ou Avatar do Interlocutor */}
            <View style={styles.imageWrapper}>
              {item.listingThumbnail ? (
                <Image 
                  source={{ uri: item.listingThumbnail }} 
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                  <Ionicons name="car" size={24} color={colors.brand} />
                </View>
              )}
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.brand }]}>
                  <Text style={[styles.unreadText, { color: '#FFFFFF', fontFamily: typography.display }]}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>

            {/* Informações */}
            <View style={styles.infoWrapper}>
              <View style={styles.headerRow}>
                <Text 
                  style={[styles.interlocutorName, { color: colors.textPrimary, fontFamily: typography.display }]}
                  numberOfLines={1}
                >
                  {item.interlocutor.name || 'Usuário PECAÊ'}
                </Text>
                <Text style={[styles.dateText, { color: colors.textMuted, fontFamily: typography.body }]}>
                  {formattedDate}
                </Text>
              </View>

              <Text 
                style={[styles.listingTitle, { color: colors.brand, fontFamily: typography.medium }]}
                numberOfLines={1}
              >
                {item.listingTitle}
              </Text>

              <Text 
                style={[styles.lastMessage, { color: item.unreadCount > 0 ? colors.textPrimary : colors.textMuted, fontFamily: typography.body }]}
                numberOfLines={1}
              >
                {item.lastMessage ? item.lastMessage.content : 'Nenhuma mensagem ainda.'}
              </Text>
            </View>
          </View>
        </PecaeGlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <PecaeBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.display }]}>
            CONVERSAS // CHAT
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body }]}>
            Negocie peças e veículos com segurança no terminal.
          </Text>
        </View>

        {isLoading && !isRefreshing ? (
          <ActivityIndicator size="large" color={colors.brand} style={styles.loader} />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={handleRefresh}
                colors={[colors.brand]}
                tintColor={colors.brand}
              />
            }
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.body }]}>
                Nenhuma conversa iniciada. Comece um chat a partir de um anúncio!
              </Text>
            }
          />
        )}
      </View>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  roomContainer: {
    width: '100%',
  },
  card: {
    padding: 16,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoWrapper: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interlocutorName: {
    fontSize: 14,
    letterSpacing: 1,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.8,
  },
  listingTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  lastMessage: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    lineHeight: 20,
  },
});
