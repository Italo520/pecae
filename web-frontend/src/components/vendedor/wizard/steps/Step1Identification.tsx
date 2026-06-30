'use client';

import { useFormContext } from 'react-hook-form';
import type { VehicleCreateInput } from '@pecae/shared';

export default function Step1Identification() {
  const { register, formState: { errors } } = useFormContext<VehicleCreateInput>();

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all";
  const labelClass = "block text-sm font-medium text-white/70 mb-1.5";
  const errorClass = "text-red-400 text-xs mt-1.5 font-medium";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-white mb-2">Identificação do Veículo</h2>
        <p className="text-white/50 text-sm">Insira os dados básicos da sucata. A placa não será exibida publicamente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placa */}
        <div className="col-span-1">
          <label className={labelClass}>Placa</label>
          <input 
            type="text" 
            placeholder="ABC-1234"
            className={`${inputClass} uppercase`}
            {...register('placa')}
          />
          {errors.placa && <p className={errorClass}>{errors.placa.message}</p>}
        </div>

        {/* Cor */}
        <div className="col-span-1">
          <label className={labelClass}>Cor predominante *</label>
          <input 
            type="text" 
            placeholder="Ex: Prata"
            className={inputClass}
            {...register('cor')}
          />
          {errors.cor && <p className={errorClass}>{errors.cor.message}</p>}
        </div>

        {/* Quilometragem */}
        <div className="col-span-1">
          <label className={labelClass}>Quilometragem</label>
          <input 
            type="number" 
            placeholder="0"
            className={inputClass}
            {...register('quilometragem', { valueAsNumber: true })}
          />
          {errors.quilometragem && <p className={errorClass}>{errors.quilometragem.message}</p>}
        </div>

        {/* Combustível */}
        <div className="col-span-1">
          <label className={labelClass}>Combustível</label>
          <select 
            className={`${inputClass} appearance-none`}
            {...register('tipoCombustivel')}
          >
            <option value="" className="bg-zinc-900 text-white/50">Selecione...</option>
            <option value="FLEX" className="bg-zinc-900">Flex</option>
            <option value="GASOLINA" className="bg-zinc-900">Gasolina</option>
            <option value="ETANOL" className="bg-zinc-900">Etanol</option>
            <option value="DIESEL" className="bg-zinc-900">Diesel</option>
            <option value="ELETRICO" className="bg-zinc-900">Elétrico</option>
            <option value="HIBRIDO" className="bg-zinc-900">Híbrido</option>
          </select>
          {errors.tipoCombustivel && <p className={errorClass}>{errors.tipoCombustivel.message}</p>}
        </div>

        {/* Cidade */}
        <div className="col-span-1 md:col-span-1">
          <label className={labelClass}>Cidade *</label>
          <input 
            type="text" 
            placeholder="Ex: São Paulo"
            className={inputClass}
            {...register('cidade')}
          />
          {errors.cidade && <p className={errorClass}>{errors.cidade.message}</p>}
        </div>

        {/* Estado */}
        <div className="col-span-1 md:col-span-1">
          <label className={labelClass}>Estado (UF) *</label>
          <input 
            type="text" 
            placeholder="SP"
            maxLength={2}
            className={`${inputClass} uppercase`}
            {...register('estado')}
          />
          {errors.estado && <p className={errorClass}>{errors.estado.message}</p>}
        </div>
      </div>
    </div>
  );
}
