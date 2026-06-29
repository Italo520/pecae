import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  mobile: 0,
  tablet: 768,

};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isMobile = width < breakpoints.tablet;
  const isTablet = width >= breakpoints.tablet;

  return {
    width,
    height,
    isMobile,
    isTablet,
    // Helper para retornar valores baseados na tela
    pick: <T>(values: { mobile: T; tablet?: T }) => {
      if (isTablet && values.tablet !== undefined) return values.tablet;
      return values.mobile;
    },
  };
};
