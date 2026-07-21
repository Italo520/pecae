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
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--border)] -z-10 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-[var(--brand)] -z-10 -translate-y-1/2 transition-all duration-300 rounded-full" 
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
                  ${isActive ? 'bg-[var(--brand)] text-[var(--brand-foreground)] border-[var(--brand)]' : 
                    isCompleted ? 'bg-[var(--surface-hover)] text-[var(--brand)] border-[var(--brand)]' : 
                    'bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)]'
                  }`}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span className={`text-xs mt-2 font-medium max-w-[80px] text-center
                ${isActive ? 'text-[var(--brand)] font-semibold' : isCompleted ? 'text-[var(--foreground)] font-semibold' : 'text-[var(--muted)]'}
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
