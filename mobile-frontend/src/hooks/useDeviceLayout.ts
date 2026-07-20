import { useWindowDimensions } from 'react-native';

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < 640;
  const isTablet = width >= 640;
  
  // Baseado no concorrente: 2 colunas tablet/mobile landscape, 1 coluna mobile
  let gridColumns = 1;
  let cardWidth: string | number = '100%';
  
  if (isTablet) {
    gridColumns = 2;
    cardWidth = (width - 40 - 12) / 2;
  }
  
  return {
    isMobile,
    isTablet,
    width,
    height,
    gridColumns,
    cardWidth,
  };
}

