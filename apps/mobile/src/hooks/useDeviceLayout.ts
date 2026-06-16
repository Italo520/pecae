import { useWindowDimensions, Platform } from 'react-native';

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isWeb: Platform.OS === 'web',
    width,
    height,
  };
}
