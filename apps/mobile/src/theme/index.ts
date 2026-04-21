import { useColorScheme } from 'react-native';
import { PecaeTokens } from './pecae-tokens';

export const usePecaeTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? PecaeTokens.colors.dark : PecaeTokens.colors.light;

  return {
    isDark,
    colors,
    typography: PecaeTokens.typography,
    effects: PecaeTokens.effects,
  };
};

export type PecaeTheme = ReturnType<typeof usePecaeTheme>;
