import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Pressable, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { PecaeGlassCard } from './PecaeGlassCard';

export type ToastType = 'warning' | 'success' | 'error' | 'auth' | 'info';

export interface PecaeToastAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface PecaeToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  actions?: PecaeToastAction[];
  onClose: () => void;
  duration?: number; // 0 = não fecha automaticamente
}

const { width } = Dimensions.get('window');

const TOAST_CONFIG: Record<ToastType, { icon: string; color: string }> = {
  auth: { icon: 'lock-closed', color: '#F59E0B' },
  warning: { icon: 'warning', color: '#F59E0B' },
  error: { icon: 'close-circle', color: '#EF4444' },
  success: { icon: 'checkmark-circle', color: '#10B981' },
  info: { icon: 'information-circle', color: '#3B82F6' },
};

export const PecaeToast: React.FC<PecaeToastProps> = ({
  visible,
  type = 'info',
  title,
  message,
  actions = [],
  onClose,
  duration = 5000,
}) => {
  const { colors, typography } = usePecaeTheme();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = TOAST_CONFIG[type];

  const show = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 60,
        useNativeDriver: true,
        tension: 60,
        friction: 9,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0 && actions.length === 0) {
      timerRef.current = setTimeout(() => hide(), duration);
    }
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <PecaeGlassCard
        padding={0}
        intensity={50}
        style={[
          styles.card,
          {
            borderColor: config.color + '55',
            shadowColor: config.color,
          },
        ]}
      >
        {/* Linha colorida no topo */}
        <View style={[styles.topBar, { backgroundColor: config.color }]} />

        <View style={styles.content}>
          {/* Ícone */}
          <View style={[styles.iconWrapper, { backgroundColor: config.color + '22' }]}>
            <Ionicons name={config.icon as any} size={22} color={config.color} />
          </View>

          {/* Textos */}
          <View style={styles.textWrapper}>
            <Text
              style={[
                styles.title,
                { color: colors.textPrimary, fontFamily: typography.display },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {message ? (
              <Text
                style={[
                  styles.message,
                  { color: colors.textMuted, fontFamily: typography.body },
                ]}
                numberOfLines={2}
              >
                {message}
              </Text>
            ) : null}
          </View>

          {/* Fechar (quando sem ações) */}
          {actions.length === 0 && (
            <Pressable onPress={hide} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Ações */}
        {actions.length > 0 && (
          <View style={styles.actionsRow}>
            {actions.map((action, idx) => (
              <Pressable
                key={idx}
                style={({ pressed }) => [[
                  styles.actionBtn,
                  action.primary
                    ? { backgroundColor: config.color , pressed && { opacity: 0.7 }]}
                    : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1 },
                ]}
                onPress={() => {
                  hide();
                  action.onPress();
                }}
              >
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: action.primary ? '#000' : colors.textPrimary,
                      fontFamily: typography.display,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </PecaeGlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  topBar: {
    height: 3,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
