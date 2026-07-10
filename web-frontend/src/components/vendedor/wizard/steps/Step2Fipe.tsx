'use client';

import { useFormContext } from 'react-hook-form';
import type { VehicleCreateInput } from '@pecae/shared';
import { useCatalogBrands, useCatalogModels, useCatalogVersions, useCatalogYears } from '@/hooks/useCatalog';
import { useState, useEffect } from 'react';

export default function Step2Fipe() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<VehicleCreateInput>();

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // Watch values if they were pre-filled when going back
  const versaoId = watch('versaoId');
  const anoId = watch('anoId');

  const { data: brands, isLoading: loadBrands } = useCatalogBrands();
  const { data: models, isLoading: loadModels } = useCatalogModels(selectedBrand);
  const { data: versions, isLoading: loadVersions } = useCatalogVersions(selectedModel);
  const { data: years, isLoading: loadYears } = useCatalogYears(versaoId || '');

  const selectClass = "w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all appearance-none";
  const labelClass = "block text-sm font-medium text-[var(--muted)] mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1.5 font-medium";

  // Reset child fields when parent changes
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
    setSelectedModel('');
    setValue('versaoId', '');
    setValue('anoId', '');
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    setValue('versaoId', '');
    setValue('anoId', '');
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('versaoId', e.target.value);
    setValue('anoId', '');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Tabela FIPE</h2>
        <p className="text-[var(--muted)] text-sm">Selecione o modelo exato do veículo na base FIPE para facilitar a busca dos compradores.</p>
      </div>

      <div className="space-y-6">
        {/* Marca */}
        <div>
          <label className={labelClass}>Marca *</label>
          <select 
            className={selectClass} 
            value={selectedBrand} 
            onChange={handleBrandChange}
            disabled={loadBrands}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {loadBrands ? 'Carregando marcas...' : 'Selecione a Marca...'}
            </option>
            {brands?.map(b => (
              <option key={b.id} value={b.id} className="bg-[var(--surface)]">{b.name}</option>
            ))}
          </select>
        </div>

        {/* Modelo */}
        <div>
          <label className={labelClass}>Modelo *</label>
          <select 
            className={selectClass}
            value={selectedModel}
            onChange={handleModelChange}
            disabled={!selectedBrand || loadModels}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {!selectedBrand ? 'Selecione a marca primeiro' : loadModels ? 'Carregando modelos...' : 'Selecione o Modelo...'}
            </option>
            {models?.map(m => (
              <option key={m.id} value={m.id} className="bg-[var(--surface)]">{m.name}</option>
            ))}
          </select>
        </div>

        {/* Versão */}
        <div>
          <label className={labelClass}>Versão *</label>
          <select 
            className={selectClass}
            value={versaoId || ''}
            onChange={handleVersionChange}
            disabled={!selectedModel || loadVersions}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {!selectedModel ? 'Selecione o modelo primeiro' : loadVersions ? 'Carregando versões...' : 'Selecione a Versão...'}
            </option>
            {versions?.map(v => (
              <option key={v.id} value={v.id} className="bg-[var(--surface)]">{v.name}</option>
            ))}
          </select>
          {errors.versaoId && <p className={errorClass}>{errors.versaoId.message}</p>}
        </div>

        {/* Ano */}
        <div>
          <label className={labelClass}>Ano *</label>
          <select 
            className={selectClass}
            {...register('anoId')}
            disabled={!versaoId || loadYears}
          >
            <option value="" className="bg-[var(--surface)] text-[var(--muted)]">
              {!versaoId ? 'Selecione a versão primeiro' : loadYears ? 'Carregando anos...' : 'Selecione o Ano...'}
            </option>
            {years?.map(y => (
              <option key={y.id} value={y.id} className="bg-[var(--surface)]">{y.name} - {y.fuelType}</option>
            ))}
          </select>
          {errors.anoId && <p className={errorClass}>{errors.anoId.message}</p>}
        </div>

      </div>
    </div>
  );
}
