'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleCreateSchema, VehicleCreateInput } from '@pecae/shared';
import Step1Identification from './steps/Step1Identification';
import Step2Fipe from './steps/Step2Fipe';
import Step3Parts from './steps/Step3Parts';
import Step4Photos from './steps/Step4Photos';
import Step5Price from './steps/Step5Price';
import { ArrowLeft, ArrowRight, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateVehicle } from '@/hooks/useVehicles';

const steps = [
  { id: 1, name: 'Identificação' },
  { id: 2, name: 'Tabela FIPE' },
  { id: 3, name: 'Peças' },
  { id: 4, name: 'Fotos' },
  { id: 5, name: 'Preço' },
];

export default function VehicleWizardClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();

  const methods = useForm<VehicleCreateInput>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      placa: '',
      cor: '',
      cidade: '',
      estado: '',
      tipoCombustivel: '',
      quilometragem: 0,
      pecasDisponiveis: [],
      observacoes: '',
    },
    mode: 'onTouched'
  });

  const { trigger, handleSubmit } = methods;

  const nextStep = async () => {
    let isValid = false;
    
    // Validate fields per step
    if (currentStep === 1) {
      isValid = await trigger(['cor', 'cidade', 'estado']);
    } else if (currentStep === 2) {
      isValid = await trigger(['versaoId', 'anoId']);
    } else if (currentStep === 3) {
      isValid = true; 
    } else if (currentStep === 4) {
      // no rigid validation for photos yet
      isValid = true; 
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    }
  };

  const onSubmit = async (data: VehicleCreateInput) => {
    try {
      await createVehicle({ ...data, photos });
      // Redirect on success
      router.push('/vendedor/dashboard');
    } catch (error) {
      console.error('Failed to create vehicle:', error, (error as any).response?.data);
      alert('Erro ao criar anúncio. Verifique os dados ou tente novamente mais tarde.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-surface)] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Progress (Desktop) / Topbar (Mobile) */}
      <div className="w-full md:w-80 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 backdrop-blur-xl flex flex-col p-6">
        <Link 
          href="/vendedor/dashboard"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Sair do Cadastro</span>
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-white">Novo Anúncio</h1>
            <p className="text-xs text-white/50">Cadastro de Sucata</p>
          </div>
        </div>

        <div className="flex-1 hidden md:flex flex-col gap-8 relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5 z-0" />
          
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive ? 'bg-[var(--color-primary)] text-black' : 
                  isCompleted ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30' : 
                  'bg-black border border-white/10 text-white/30'
                }`}>
                  {isCompleted ? '✓' : step.id}
                </div>
                <span className={`font-medium ${
                  isActive ? 'text-white' : 
                  isCompleted ? 'text-white/70' : 
                  'text-white/30'
                }`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper simple view */}
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm text-[var(--color-primary)] font-medium">Passo {currentStep} de {steps.length}</span>
          <span className="text-white/80 font-medium">{steps[currentStep - 1].name}</span>
        </div>
      </div>

      {/* Main Content Form Area */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)]">
        <div className="max-w-2xl mx-auto p-6 md:p-12 w-full min-h-full flex flex-col">
          
          <div className="flex-1">
            <FormProvider {...methods}>
              <form id="wizard-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && <Step1Identification />}
                {currentStep === 2 && <Step2Fipe />}
                {currentStep === 3 && <Step3Parts />}
                {currentStep === 4 && <Step4Photos photos={photos} setPhotos={setPhotos} />}
                {currentStep === 5 && <Step5Price />}
              </form>
            </FormProvider>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isPending}
              className="px-6 py-3 rounded-xl font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-0"
            >
              Voltar
            </button>
            
            {currentStep < steps.length ? (
              <button
                key="btn-next"
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_25px_rgba(20,241,149,0.5)]"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                form="wizard-form"
                disabled={isPending}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-70 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_25px_rgba(20,241,149,0.5)]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <span>Finalizar e Anunciar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
