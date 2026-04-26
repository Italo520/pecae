import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PecaeBackground, PecaeGlassCard } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/store/auth-store';
import { Ionicons } from '@expo/vector-icons';

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
  interlocutor: {
    id: string;
    name: string | null;
    avatar: string | null;
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
      // O backend retorna as mensagens em ordem decrescente de criação
      setMessages(response.data.items.reverse());
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

    // Loop de polling para tempo real (fallback robusto para React Native)
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);

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
      
      // Rolar para o final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const navigateToAvaliar = () => {
    if (!room) return;
    router.push(`/chat/${roomId}/avaliar`);
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
          intensity={isMe ? 30 : 15} 
          style={[
            styles.messageCard, 
            { 
              borderRadius: effects.radius.md,
              borderColor: isMe ? colors.brand : colors.border,
              backgroundColor: isMe ? `${colors.brand}33` : colors.surface,
            }
          ]}
        >
          <Text style={[styles.messageText, { color: colors.textPrimary, fontFamily: typography.body }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: colors.textMuted, fontFamily: typography.body }]}>
            {formattedTime}
          </Text>
        </PecaeGlassCard>
      </View>
    );
  };

  if (isLoading) {
    return (
      <PecaeBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </PecaeBackground>
    );
  }

  return (
    <PecaeBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.interlocutorName, { color: colors.textPrimary, fontFamily: typography.display }]}>
              {room?.interlocutor.name || 'Usuário PECAÊ'}
            </Text>
            <Text style={[styles.listingTitle, { color: colors.brand, fontFamily: typography.medium }]} numberOfLines={1}>
              {room?.listingTitle}
            </Text>
          </View>

          <TouchableOpacity onPress={navigateToAvaliar} style={styles.actionButton}>
            <Ionicons name="star-outline" size={22} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {/* Mensagens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary, fontFamily: typography.body, backgroundColor: colors.surface }]}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.textMuted}
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
                backgroundColor: newMessage.trim() ? colors.brand : colors.surface,
                borderColor: colors.border
              }
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() ? '#FFFFFF' : colors.textMuted} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  interlocutorName: {
    fontSize: 16,
    letterSpacing: 1,
  },
  listingTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
