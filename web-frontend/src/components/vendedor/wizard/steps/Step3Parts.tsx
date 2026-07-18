'use client';

import { useFormContext } from 'react-hook-form';
import type { VehicleCreateInput } from '@pecae/shared';
import { usePartCategories } from '@/hooks/useCatalog';
import { 
  Settings, 
  Disc, 
  Zap, 
  Wind, 
  Thermometer, 
  Battery, 
  Droplets,
  Wrench,
  ShieldAlert,
  CarFront,
  Eye,
  Layout,
  Archive,
  DoorOpen,
  Lightbulb,
  Gauge,
  Loader2
} from 'lucide-react';

const SLUG_ICONS: Record<string, any> = {
  'motor': Settings,
  'cambio-transmissao': Disc,
  'sistema-eletrico': Zap,
  'suspensao': Wind,
  'radiador': Thermometer,
  'freios': ShieldAlert,
  'carroceria': CarFront,
  'interior-bancos': Battery,
  'ar-condicionado': Wind,
  'escapamento': Gauge,
  'vidros': Droplets,
  'farois-lanternas': Lightbulb,
  'rodas-pneus': Disc,
  'retrovisores': Eye,
  'painel': Layout,
  'tampa-traseira': Archive,
  'portas': DoorOpen,
};

function getCategoryIcon(slug: string) {
  return SLUG_ICONS[slug] || Wrench;
}

export default function Step3Parts() {
  const { register, watch, formState: { errors } } = useFormContext<VehicleCreateInput>();
  const { data: categories, isLoading } = usePartCategories();
  
  const selectedParts = watch('pecasDisponiveis') || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Peças Intactas</h2>
        <p className="text-[var(--muted)] text-sm">Selecione os grupos de peças que estão em bom estado nesta sucata. Isso ajuda os compradores na busca avançada.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
          <p className="text-[var(--muted)] text-sm">Carregando categorias de peças da Forja...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories?.map((category) => {
            const isSelected = selectedParts.includes(category.id);
            const Icon = getCategoryIcon(category.slug);

            return (
              <label 
                key={category.id} 
                className={`
                  relative cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all border
                  ${isSelected 
                    ? 'bg-[var(--brand)]/10 border-[var(--brand)]/50 text-[var(--brand)]' 
                    : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]/80 hover:text-[var(--foreground)]'}
                `}
              >
                <input 
                  type="checkbox" 
                  value={category.id}
                  className="sr-only"
                  {...register('pecasDisponiveis')}
                />
                <Icon className={`w-8 h-8 ${isSelected ? 'text-[var(--brand)]' : 'text-[var(--muted)]'}`} />
                <span className="text-sm font-medium leading-tight">
                  {category.name}
                </span>
                
                {/* Checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--brand)] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      )}
      
      {errors.pecasDisponiveis && (
        <p className="text-red-500 text-sm font-medium mt-2">{errors.pecasDisponiveis.message}</p>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 mt-8">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-blue-500 font-medium mb-1">Dica de Venda</h4>
          <p className="text-blue-500/80 text-sm leading-relaxed">
            Sucatas com categorias de peças bem definidas vendem 3x mais rápido. Se você não tem certeza do estado de um sistema inteiro, não o marque.
          </p>
        </div>
      </div>
    </div>
  );
}
