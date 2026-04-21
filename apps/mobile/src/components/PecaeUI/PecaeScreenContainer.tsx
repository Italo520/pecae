import React from 'react';
import { StyleSheet, View, Platform, ViewStyle, ScrollView } from 'react-native';

interface PecaeScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const PecaeScreenContainer: React.FC<PecaeScreenContainerProps> = ({ 
  children, 
  style,
  scrollable = false 
}) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  
  return (
    <View style={styles.outerContainer}>
      <ContentWrapper 
        style={[styles.innerContainer, style]}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ContentWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  }
});
