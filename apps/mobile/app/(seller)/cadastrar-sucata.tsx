import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePecaeTheme } from '../../src/theme';
import { PecaeBackground } from '../../src/components/PecaeUI/PecaeBackground';
import { PecaeScreenContainer } from '../../src/components/PecaeUI/PecaeScreenContainer';
import { useVehicleWizardStore } from '../../src/store/vehicle-wizard-store';

// Step Components
import { Step1VehicleSelection } from '../../src/components/VehicleWizard/Step1VehicleSelection';
import { Step2TechDetails } from '../../src/components/VehicleWizard/Step2TechDetails';
import { Step3Photos } from '../../src/components/VehicleWizard/Step3Photos';
import { Step4Inventory } from '../../src/components/VehicleWizard/Step4Inventory';
import { Step5Review } from '../../src/components/VehicleWizard/Step5Review';

export default function CadastrarSucataScreen() {
  const { colors, typography } = usePecaeTheme();
  const { currentStep, resetWizard } = useVehicleWizardStore();
  const router = useRouter();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1VehicleSelection />;
      case 2: return <Step2TechDetails />;
      case 3: return <Step3Photos />;
      case 4: return <Step4Inventory />;
      case 5: return <Step5Review />;
      default: return <Step1VehicleSelection />;
    }
  };

  const handleClose = () => {
    resetWizard();
    router.back();
  };

  return (
    <PecaeBackground>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.stepIndicator}>
              <Text style={{ color: colors.brand, fontFamily: typography.bold }}>
                {currentStep} / 5
              </Text>
            </View>
          )
        }} 
      />
      
      <PecaeScreenContainer>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.surface }]} >
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.brand, 
                  width: `${(currentStep / 5) * 100}%` 
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.content}>
          {renderStep()}
        </View>
      </PecaeScreenContainer>
    </PecaeBackground>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    padding: 8,
  },
  stepIndicator: {
    marginRight: 15,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 60, // Space for header
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
});
