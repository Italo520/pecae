'use client';

import { useFormContext } from 'react-hook-form';
import type { VehicleCreateInput } from '@pecae/shared';
import { useCatalogBrands, useCatalogModels, useCatalogYears } from '@/hooks/useCatalog';


export default function Step2Fipe() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<VehicleCreateInput>();

  const brandCode = watch('brandCode');
  const modelCode = watch('modelCode');
  const yearCode = watch('yearCode');

  const { data: brands, isLoading: loadBrands } = useCatalogBrands();
  const { data: models, isLoading: loadModels } = useCatalogModels(brandCode);
  const { data: years, isLoading: loadYears } = useCatalogYears(brandCode, modelCode);

  const selectClass = "w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all appearance-none";
  const labelClass = "block text-sm font-medium text-[var(--muted)] mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1.5 font-medium";

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = brands?.find(b => b.id === code)?.name || '';
    setValue('brandCode', code);
    setValue('marcaNome', name, { shouldValidate: true });
    
    // Reset children
    setValue('modelCode', '');
    setValue('modeloNome', '');
    setValue('yearCode', '');
    setValue('anoNome', '');
    setValue('versaoNome', '');
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = models?.find(m => m.id === code)?.name || '';
    setValue('modelCode', code);
    setValue('modeloNome', name, { shouldValidate: true });
    
    // Reset children
    setValue('yearCode', '');
    setValue('anoNome', '');
    setValue('versaoNome', '');
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedYearObj = years?.find(y => y.id === code);
    const name = selectedYearObj?.name || '';
    
    setValue('yearCode', code);
    setValue('anoNome', name, { shouldValidate: true });
    
    // In Parallelum, year often contains the version details for cars (e.g., "1992 Gasolina")
    setValue('versaoNome', name);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Tabela FIPE</h2>
        <p className="text-[var(--muted)] text-sm">Selecione o modelo exato do veículo na base FIPE oficial para garantir que seu anúncio seja encontrado nas buscas.</p>
      </div>

      <div className="space-y-6">
        {/* Marca */}
        <div>
          <label className={labelClass}>Marca *</label>
          <select 
            className={selectClass} 
            value={brandCode || ''} 
            onChange={handleBrandChange}
            disabled={loadBrands}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {loadBrands ? 'Carregando marcas da FIPE...' : 'Selecione a Marca...'}
            </option>
            {brands?.map(b => (
              <option key={b.id} value={b.id} className="bg-[var(--surface)]">{b.name}</option>
            ))}
          </select>
          {errors.marcaNome && <p className={errorClass}>{errors.marcaNome.message}</p>}
        </div>

        {/* Modelo */}
        <div>
          <label className={labelClass}>Modelo *</label>
          <select 
            className={selectClass}
            value={modelCode || ''}
            onChange={handleModelChange}
            disabled={!brandCode || loadModels}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {!brandCode ? 'Selecione a marca primeiro' : loadModels ? 'Carregando modelos da FIPE...' : 'Selecione o Modelo...'}
            </option>
            {models?.map(m => (
              <option key={m.id} value={m.id} className="bg-[var(--surface)]">{m.name}</option>
            ))}
          </select>
          {errors.modeloNome && <p className={errorClass}>{errors.modeloNome.message}</p>}
        </div>

        {/* Ano / Versão */}
        <div>
          <label className={labelClass}>Ano *</label>
          <select 
            className={selectClass}
            value={yearCode || ''}
            onChange={handleYearChange}
            disabled={!modelCode || loadYears}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {!modelCode ? 'Selecione o modelo primeiro' : loadYears ? 'Carregando anos...' : 'Selecione o Ano...'}
            </option>
            {years?.map(y => (
              <option key={y.id} value={y.id} className="bg-[var(--surface)]">{y.name}</option>
            ))}
          </select>
          {errors.anoNome && <p className={errorClass}>{errors.anoNome.message}</p>}
        </div>

      </div>
    </div>
  );
}
