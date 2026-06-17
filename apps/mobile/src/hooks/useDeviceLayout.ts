import { useWindowDimensions, Platform } from 'react-native';

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  
  // Baseado no concorrente: 4 colunas desktop, 2 colunas tablet/mobile landscape, 1 coluna mobile
  let gridColumns = 1;
  let cardWidth: string | number = '100%';
  
  if (isDesktop) {
    gridColumns = 4;
    // No web, usar calc garante o preenchimento exato descontando o gap, ignorando problemas de scrollbar
    cardWidth = Platform.OS === 'web' ? 'calc(25% - 9px)' : (width - 64 - 36) / 4;
  } else if (isTablet) {
    gridColumns = 2;
    cardWidth = Platform.OS === 'web' ? 'calc(50% - 6px)' : (width - 40 - 12) / 2;
  }
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isWeb: Platform.OS === 'web',
    width,
    height,
    gridColumns,
    cardWidth,
  };
}
