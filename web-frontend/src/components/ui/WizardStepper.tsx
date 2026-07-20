'use client';

import React from 'react';

interface WizardStepperProps {
  currentStep: number;
  steps: string[];
}

export const WizardStepper = ({ currentStep, steps }: WizardStepperProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-[#3FFF8B] -z-10 -translate-y-1/2 transition-all duration-300 rounded-full" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300
                  ${isActive ? 'bg-[#3FFF8B] text-black border-[#3FFF8B]' : 
                    isCompleted ? 'bg-gray-800 text-[#3FFF8B] border-[#3FFF8B]' : 
                    'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span className={`text-xs mt-2 font-medium max-w-[80px] text-center
                ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
