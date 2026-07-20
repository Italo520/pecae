import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, SafeAreaView, Animated, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PecaeBackground, PecaeGlassCard, ReportBottomSheet } from '../../src/components/PecaeUI';
import { usePecaeTheme } from '../../src/theme';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/store/auth-store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useStomp } from '../../src/hooks/useStomp';
import { useChats, RoomDetails } from '../../src/hooks/useChats';
import { useChatMessages, Message } from '../../src/hooks/useChatMessages';

// Componente de mensagem com animação
const AnimatedMessage = ({ item, isMe, colors, typography }: { item: Message; isMe: boolean; colors: any; typography: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formattedTime = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isImage = item.content.startsWith('[IMAGE]:');
  const imageUrl = isImage ? item.content.replace('[IMAGE]:', '') : '';

  return (
    <Animated.View 
      style={[
        styles.messageRow, 
        isMe ? styles.myMessageRow : styles.otherMessageRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <PecaeGlassCard 
        intensity={isMe ? 30 : 15} 
        style={[
          styles.messageCard, 
          { 
            borderRadius: 20,
            borderBottomRightRadius: isMe ? 4 : 20,
            borderBottomLeftRadius: isMe ? 20 : 4,
            backgroundColor: isMe ? 'rgba(63, 255, 139, 0.1)' : 'rgba(255,255,255,0.05)',
            borderColor: isMe ? colors.brand + '44' : 'rgba(255,255,255,0.05)',
            padding: isImage ? 4 : 12,
          }
        ]}
      >
        {isImage ? (
          <TouchableOpacity onPress={() => Linking.openURL(imageUrl)}>
            <Image 
              source={{ uri: imageUrl }} 
              style={{
                width: 200,
                height: 150,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.messageText, { color: colors.textPrimary, fontFamily: typography.body }]}>
            {item.content}
          </Text>
        )}
        <View style={[styles.messageFooter, { paddingHorizontal: isImage ? 8 : 0, paddingBottom: isImage ? 4 : 0 }]}>
          <Text style={[styles.messageTime, { color: colors.textMuted, fontFamily: typography.body }]}>
            {formattedTime}
          </Text>
          {isMe && (
            <Ionicons 
              name={item.lido ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={item.lido ? colors.brand : colors.textMuted} 
              style={{ marginLeft: 4 }} 
            />
          )}
        </View>
      </PecaeGlassCard>
    </Animated.View>
  );
};

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { colors, typography, effects, isDark } = usePecaeTheme();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const hudAnim = useRef(new Animated.Value(0)).current;
  const { connected, subscribe, publish } = useStomp();
  const { getRoomDetails, markAsRead } = useChats(roomId as string);
  const { getMessages, uploadAttachment, addMessageToCache, setInitialMessages } = useChatMessages(roomId as string);

  const room = getRoomDetails.data;
  const messages = getMessages.data || [];
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);

  useEffect(() => {
    if (room) {
      Animated.spring(hudAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      }).start();
    }
  }, [room]);

  useEffect(() => {
    if (roomId && token) {
      markAsRead.mutate();
    }
  }, [roomId, token]);

  useEffect(() => {
    if (!connected || !roomId) return;

    // 1. Entra na sala
    publish(`/app/chat.join/${roomId}`, {});

    // 2. Assina o tópico de novas mensagens da sala
    const roomSub = subscribe(`/topic/room/${roomId}`, (newMsg: Message) => {
      addMessageToCache(newMsg);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // 3. Assina a fila privada do usuário para receber o histórico inicial
    const historySub = subscribe(`/user/queue/historico`, (history: any) => {
      if (history && history.itens) {
        const reversed = [...history.itens].reverse();
        setInitialMessages(reversed);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      if (roomSub) roomSub.unsubscribe();
      if (historySub) historySub.unsubscribe();
    };
  }, [connected, roomId, subscribe, publish]);

  const isBlocked = (() => {
    if (!room?.anuncioStatus || !room?.anuncioVendidoEm) return false;
    if (room.anuncioStatus !== 'VENDIDO' && room.anuncioStatus !== 'ENCERRADO') return false;
    const soldTime = new Date(room.anuncioVendidoEm).getTime();
    const now = Date.now();
    const diffHours = (now - soldTime) / (1000 * 60 * 60);
    return diffHours > 6;
  })();

  const handleSend = () => {
    if (!newMessage.trim() || !connected || isBlocked) return;

    try {
      publish(`/app/chat.send/${roomId}`, { conteudo: newMessage.trim() });
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem via STOMP:', error);
    }
  };

  const handleSelectImage = async () => {
    if (isBlocked) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Desculpe, precisamos de permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsSending(true);
      const { url } = await uploadAttachment.mutateAsync({ uri, roomId: roomId as string });
      publish(`/app/chat.send/${roomId}`, { conteudo: `[IMAGE]:${url}` });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!room?.listingId) return;

    try {
      await api.patch(`/listings/${room.listingId}/sold`);
      // Feedback visual e redirecionamento ou atualização de status
      alert('Veículo marcado como vendido com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error);
      alert('Erro ao processar a venda.');
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return <AnimatedMessage item={item} isMe={isMe} colors={colors} typography={typography} />;
  };

  if (getRoomDetails.isLoading && !room) {
    return (
      <PecaeBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: typography.display, marginTop: 16 }]}>
            ESTABLISHING SECURE CHANNEL...
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
          {/* Header HUD - Refinado para Digital Forge */}
          <Animated.View style={{ transform: [{ translateY: hudAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }] }}>
            <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={[styles.headerHUD, { borderBottomColor: colors.brand + '33' }]}>
              <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                
                <View style={styles.interlocutorInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.interlocutorName, { color: colors.textPrimary, fontFamily: typography.display }]}>
                      {room?.interlocutor.name?.toUpperCase() || 'USUÁRIO PECAÊ'}
                    </Text>
                    {room?.interlocutor.isVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color={colors.brand} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: colors.brand }]} />
                    <Text style={[styles.statusText, { color: colors.brand, fontFamily: typography.mono, fontSize: 7, opacity: 0.8 }]}>
                      SECURE_COMM_v1.04 // {new Date().toLocaleTimeString()}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {user?.id === room?.sellerId && (
                    <TouchableOpacity 
                      onPress={handleMarkAsSold}
                      style={[styles.soldButton, { backgroundColor: colors.brand + '20', borderColor: colors.brand }]}
                    >
                      <Text style={[styles.soldButtonText, { color: colors.brand, fontFamily: typography.display }]}>VENDIDO</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.optionsButton}
                    onPress={() => setIsReportVisible(true)}
                  >
                    <Ionicons name="alert-circle-outline" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Vehicle context HUD - Estilo Digital Forge */}
              {room && (
                <PecaeGlassCard intensity={20} padding={8} style={[styles.itemStrip, { borderColor: colors.brand + '22' }]}>
                  <View style={styles.itemThumbContainer}>
                    <Image source={{ uri: room.listingThumbnail || '' }} style={styles.itemThumb} />
                    <View style={styles.photoOverlap} />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary, fontFamily: typography.display }]} numberOfLines={1}>
                      {room.listingTitle?.toUpperCase() || 'VEÍCULO DOADOR'}
                    </Text>
                    <View style={styles.tagRow}>
                      <View style={[styles.tag, { backgroundColor: colors.brand + '15', borderColor: colors.brand + '33' }]}>
                        <Text style={[styles.tagText, { color: colors.brand, fontFamily: typography.display }]}>OPEN_DEAL</Text>
                      </View>
                      <Text style={[styles.technicalCode, { color: colors.textMuted, fontFamily: typography.mono }]}>
                        REF_{room.listingId ? room.listingId.substring(0, 8).toUpperCase() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push(`/vehicle/${room.listingId}`)}
                    style={[styles.viewButton, { backgroundColor: colors.brand + '10', borderColor: colors.brand + '44' }]}
                  >
                    <Text style={[styles.viewButtonText, { color: colors.brand, fontFamily: typography.display }]}>VIEW_UNIT</Text>
                  </TouchableOpacity>
                </PecaeGlassCard>
              )}
            </BlurView>
          </Animated.View>

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
            {isBlocked && (
              <View style={[styles.blockedContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Ionicons name="lock-closed-outline" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={[styles.blockedText, { color: '#ef4444', fontFamily: typography.body }]}>
                  Conversa encerrada. O anúncio foi finalizado há mais de 6 horas.
                </Text>
              </View>
            )}

            {!isBlocked && (
              <FlatList
                horizontal
                data={['A peça está disponível?', 'Qual o menor valor?', 'Consigo retirar hoje?', 'Tem garantia?']}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setNewMessage(item)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#111' : '#EEE',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.textPrimary, fontFamily: typography.medium }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <PecaeGlassCard intensity={25} padding={4} style={[styles.inputContainer, { borderRadius: 30, borderColor: colors.brand + '22', opacity: isBlocked ? 0.6 : 1 }]}>
              <TouchableOpacity 
                style={styles.attachButton} 
                onPress={handleSelectImage}
                disabled={isBlocked || isSending}
              >
                <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, fontFamily: typography.body }]}
                placeholder={isBlocked ? "Chat bloqueado..." : "Transmit message..."}
                placeholderTextColor={`${colors.textMuted}66`}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={1000}
                editable={!isBlocked}
              />
              
              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!newMessage.trim() || isSending || isBlocked}
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: (newMessage.trim() && !isBlocked) ? colors.brand : 'transparent',
                  }
                ]}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons 
                    name="chevron-up" 
                    size={28} 
                    color={(newMessage.trim() && !isBlocked) ? '#000' : colors.textMuted} 
                  />
                )}
              </TouchableOpacity>
            </PecaeGlassCard>
          </View>
        </KeyboardAvoidingView>

        <ReportBottomSheet
          isVisible={isReportVisible}
          onClose={() => setIsReportVisible(false)}
          chatRoomId={roomId}
          reportedUserId={room?.interlocutor.id}
          targetName={room?.interlocutor.name || 'Usuário'}
        />
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
    fontSize: 14,
    letterSpacing: 1,
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
    fontSize: 8,
    letterSpacing: 1,
  },
  optionsButton: {
    padding: 8,
  },
  soldButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  soldButtonText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  itemStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
  },
  itemThumbContainer: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    zIndex: 2,
  },
  photoOverlap: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(63, 255, 139, 0.1)',
    zIndex: 1,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  tagText: {
    fontSize: 7,
    letterSpacing: 1,
  },
  technicalCode: {
    fontSize: 7,
    opacity: 0.5,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 8,
    letterSpacing: 1.2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
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
    padding: 4,
    borderWidth: 1,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  blockedText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
