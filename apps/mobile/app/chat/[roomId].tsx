import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PecaeBackground, PecaeGlassCard } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/store/auth-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface RoomDetails {
  id: string;
  listingId: string;
  listingTitle: string;
  listingThumbnail: string | null;
  listingPrice?: number;
  interlocutor: {
    id: string;
    name: string | null;
    avatar: string | null;
    isVerified?: boolean;
  };
}

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { colors, typography, effects } = usePecaeTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchRoomDetails = async () => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes da sala:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      const items = response.data.items || [];
      setMessages(items.reverse());
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put(`/chat/rooms/${roomId}/read`);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
    fetchMessages();
    markAsRead();

    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      const response = await api.post(`/chat/rooms/${roomId}/messages`, {
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    const formattedTime = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <PecaeGlassCard 
          intensity={isMe ? 35 : 15} 
          style={[
            styles.messageCard, 
            { 
              borderRadius: effects.radius.md,
              borderTopRightRadius: isMe ? 2 : effects.radius.md,
              borderTopLeftRadius: isMe ? effects.radius.md : 2,
              borderColor: isMe ? `${colors.brand}88` : colors.border,
              backgroundColor: isMe ? `${colors.brand}15` : 'rgba(255,255,255,0.03)',
            }
          ]}
        >
          <Text style={[styles.messageText, { color: colors.textPrimary, fontFamily: typography.body }]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { color: colors.textMuted, fontFamily: typography.body }]}>
              {formattedTime}
            </Text>
            {isMe && <Ionicons name="checkmark-done" size={14} color={colors.brand} style={{ marginLeft: 4 }} />}
          </View>
        </PecaeGlassCard>
      </View>
    );
  };

  if (isLoading && !room) {
    return (
      <PecaeBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: typography.body, marginTop: 16 }]}>
            LOADING SECURE CHANNEL...
          </Text>
        </View>
      </PecaeBackground>
    );
  }

  return (
    <PecaeBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header HUD */}
          <BlurView intensity={20} style={[styles.headerHUD, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              
              <View style={styles.interlocutorInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.interlocutorName, { color: colors.textPrimary, fontFamily: typography.display }]}>
                    {room?.interlocutor.name || 'Usuário PECAÊ'}
                  </Text>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={colors.brand} style={{ marginLeft: 4 }} />
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: colors.brand }]} />
                  <Text style={[styles.statusText, { color: colors.textMuted, fontFamily: typography.body }]}>
                    SECURE CONNECTION ACTIVE
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => router.push({
                  pathname: `/chat/${roomId}/avaliar`,
                  params: { 
                    sellerId: room?.interlocutor.id,
                    storeName: room?.interlocutor.name
                  }
                })}
                style={styles.actionButton}
              >
                <Ionicons name="star-outline" size={22} color={colors.brand} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionsButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Item Details Strip */}
            {room && (
              <PecaeGlassCard intensity={5} style={styles.itemStrip}>
                <Image source={{ uri: room.listingThumbnail || '' }} style={styles.itemThumb} />
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary, fontFamily: typography.medium }]} numberOfLines={1}>
                    {room.listingTitle?.toUpperCase() || 'NEGOCIAÇÃO'}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.brand, fontFamily: typography.display }]}>
                    {room.listingPrice ? `R$ ${room.listingPrice.toFixed(2)}` : 'NEGOTIABLE'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push(`/vehicle/${room.listingId}`)}
                  style={[styles.viewButton, { borderColor: `${colors.brand}44` }]}
                >
                  <Text style={[styles.viewButtonText, { color: colors.brand, fontFamily: typography.display }]}>VIEW</Text>
                </TouchableOpacity>
              </PecaeGlassCard>
            )}
          </BlurView>

          {/* Messages Area */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Input Bar */}
          <View style={styles.inputWrapper}>
            <PecaeGlassCard intensity={20} style={[styles.inputContainer, { borderRadius: effects.radius.full }]}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add" size={24} color={colors.textMuted} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, fontFamily: typography.body }]}
                placeholder="Secure message..."
                placeholderTextColor={`${colors.textMuted}88`}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={1000}
              />
              
              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!newMessage.trim() || isSending}
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: newMessage.trim() ? colors.brand : 'transparent',
                    opacity: newMessage.trim() ? 1 : 0.5
                  }
                ]}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons 
                    name="arrow-up" 
                    size={22} 
                    color={newMessage.trim() ? '#000' : colors.textMuted} 
                  />
                )}
              </TouchableOpacity>
            </PecaeGlassCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    letterSpacing: 2,
  },
  headerHUD: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  interlocutorInfo: {
    flex: 1,
    marginLeft: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interlocutorName: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  actionButton: {
    padding: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  optionsButton: {
    padding: 8,
  },
  itemStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 10,
    letterSpacing: 1,
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageCard: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 9,
    opacity: 0.5,
  },
  inputWrapper: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

