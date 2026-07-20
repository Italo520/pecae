import React from 'react';
import { View, StyleSheet, ScrollView, ScrollViewProps } from 'react-native';
import { useDeviceLayout } from '../../hooks/useDeviceLayout';

interface PageContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  noScroll?: boolean;
}

export function PageContainer({ children, noScroll = false, contentContainerStyle, ...props }: PageContainerProps) {
  const { isTablet } = useDeviceLayout();
  
  const content = (
    <View style={[styles.innerContainer, isTablet && styles.innerContainerTablet]}>
      {children}
    </View>
  );

  if (noScroll) {
    return <View style={[styles.container, contentContainerStyle]}>{content}</View>;
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      {...props}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
  },
  innerContainerTablet: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
});
