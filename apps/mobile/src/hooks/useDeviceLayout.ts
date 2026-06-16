import { useWindowDimensions, Platform } from 'react-native';

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  
  // Baseado no concorrente: 4 colunas desktop, 2 colunas tablet/mobile landscape, 1 coluna mobile
  let gridColumns = 1;
  let cardWidth = '100%';
  
  if (isDesktop) {
    gridColumns = 4;
    cardWidth = '23%'; // 4 colunas com margem segura para gaps
  } else if (isTablet) {
    gridColumns = 2;
    cardWidth = '48%'; // 2 colunas com margem segura para gaps
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
