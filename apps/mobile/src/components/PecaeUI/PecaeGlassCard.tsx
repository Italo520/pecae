import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { usePecaeTheme } from '../../theme';

interface PecaeGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export const PecaeGlassCard: React.FC<PecaeGlassCardProps> = ({
  children,
  style,
  intensity = 20,
  padding = 20,
}) => {
  const { colors, effects, isDark } = usePecaeTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          borderRadius: effects.radius.md,
          // Ambient Glow in Dark Mode
          shadowColor: isDark ? colors.brand : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.04 : 0,
          shadowRadius: 10,
          elevation: isDark ? 2 : 0,
        }, 
        style
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blur,
          {
            borderRadius: effects.radius.md,
            backgroundColor: colors.surface,
            // The "No-Line" Border Rule: tonal highlight
            borderColor: colors.border,
            borderTopColor: isDark ? 'rgba(63, 255, 139, 0.3)' : 'rgba(255, 255, 255, 0.6)',
            borderLeftColor: isDark ? 'rgba(63, 255, 139, 0.3)' : 'rgba(255, 255, 255, 0.6)',
          },
        ]}
      >
        <View style={[styles.content, { padding }]}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden', // Allow shadow on iOS
    borderWidth: 0,
  },
  blur: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
  },
});
