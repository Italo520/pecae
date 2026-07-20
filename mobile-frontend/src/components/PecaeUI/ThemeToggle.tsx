import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePecaeTheme } from '../../theme';
import { useUIStore } from '../../store/ui-store';

export const ThemeToggle = () => {
  const { colors, isDark } = usePecaeTheme();
  const { themeMode, setThemeMode } = useUIStore();

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity 
      onPress={toggleTheme}
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border
        }
      ]}
      activeOpacity={0.7}
    >
      {isDark ? (
        <Feather name="sun" size={20} color={colors.vibrant} />
      ) : (
        <Feather name="moon" size={20} color={colors.textPrimary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
