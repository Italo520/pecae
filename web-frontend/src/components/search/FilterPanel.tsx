'use client';

import React, { useEffect, useState } from 'react';
import { VehicleSearchInput } from '@/types/search.types';
import { Brand } from '@/types/catalog.types';
import { useBrands, useModels, useVersions } from '@/hooks/useCatalog';

interface FilterPanelProps {
  initialBrands: Brand[];
  searchParams: VehicleSearchInput;
  onFilterChange: (key: keyof VehicleSearchInput, value: string | undefined) => void;
  onClearFilters: () => void;
}

const VEHICLE_TYPES = ['Carro', 'Moto', 'Caminhão', 'Ônibus'];
const STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'CE', 'PE', 'GO', 'AM', 'PA', 'MT', 'MS', 'ES', 'PB', 'RN', 'AL', 'SE', 'PI', 'MA', 'RO', 'RR', 'AC', 'AP', 'TO'];

export function FilterPanel({ initialBrands, searchParams, onFilterChange, onClearFilters }: FilterPanelProps) {
  const { data: brands = initialBrands } = useBrands();
  const { data: models = [], isFetching: isFetchingModels } = useModels(searchParams.brandId);
  const { data: versions = [], isFetching: isFetchingVersions } = useVersions(searchParams.modelId, searchParams.year);

  const [queryLocal, setQueryLocal] = useState(searchParams.query || '');

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (queryLocal !== searchParams.query) {
        onFilterChange('query', queryLocal || undefined);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [queryLocal, onFilterChange, searchParams.query]);

  // Handle cascaded changes safely
  const handleBrandChange = (brandId: string) => {
    onFilterChange('brandId', brandId || undefined);
    onFilterChange('modelId', undefined);
    onFilterChange('year', undefined);
    onFilterChange('versionId', undefined);
  };

  const handleModelChange = (modelId: string) => {
    onFilterChange('modelId', modelId || undefined);
    onFilterChange('year', undefined);
    onFilterChange('versionId', undefined);
  };

  const handleYearChange = (year: string) => {
    onFilterChange('year', year || undefined);
    onFilterChange('versionId', undefined);
  };

  return (
    <div className="flex flex-col gap-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold">Filtros</h2>
        <button 
          onClick={onClearFilters}
          className="text-sm text-[var(--brand)] hover:underline font-medium"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Busca</label>
        <input 
          type="text" 
          placeholder="Ex: Motor Honda Civic" 
          value={queryLocal}
          onChange={(e) => setQueryLocal(e.target.value)}
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Tipo</label>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="radio" 
                name="vehicleType" 
                value={type} 
                checked={searchParams.vehicleCategory === type}
                onChange={(e) => onFilterChange('vehicleCategory', e.target.value)}
                className="text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Marca</label>
        <select 
          value={searchParams.brandId || ''}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        >
          <option value="">Todas as Marcas</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Modelo {isFetchingModels && <span className="text-[var(--muted)] text-xs">(Buscando...)</span>}</label>
        <select 
          value={searchParams.modelId || ''}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!searchParams.brandId}
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Todos os Modelos</option>
          {models.map(model => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Ano</label>
        <input 
          type="number"
          min="1960"
          max={new Date().getFullYear() + 1}
          value={searchParams.year || ''}
          onChange={(e) => handleYearChange(e.target.value)}
          disabled={!searchParams.modelId}
          placeholder="Ex: 2018"
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Versão {isFetchingVersions && <span className="text-[var(--muted)] text-xs">(Buscando...)</span>}</label>
        <select 
          value={searchParams.versionId || ''}
          onChange={(e) => onFilterChange('versionId', e.target.value || undefined)}
          disabled={!searchParams.year}
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Todas as Versões</option>
          {versions.map(version => (
            <option key={version.id} value={version.id}>{version.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Estado</label>
        <select 
          value={searchParams.state || ''}
          onChange={(e) => onFilterChange('state', e.target.value || undefined)}
          className="w-full px-3 py-2 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        >
          <option value="">Brasil inteiro</option>
          {STATES.map(uf => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
