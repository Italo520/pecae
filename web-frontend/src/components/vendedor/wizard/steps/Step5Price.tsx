'use client';

import { useFormContext } from 'react-hook-form';
import type { VehicleCreateInput } from '@pecae/shared';

export default function Step5Price() {
  const { register, watch, formState: { errors } } = useFormContext<VehicleCreateInput>();
  
  const placa = watch('placa');

  const inputClass = "w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all";
  const labelClass = "block text-sm font-medium text-[var(--muted)] mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Revisão Final</h2>
        <p className="text-[var(--muted)] text-sm">Adicione detalhes extras. Lembre-se: os valores das peças são negociados diretamente no chat.</p>
      </div>

      <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-500 font-medium text-sm">
            O sistema operará no modelo &quot;Preço sob consulta&quot;. Os compradores entrarão em contato para solicitar cotações.
          </p>
        </div>

        <div>
          <label className={labelClass}>Observações adicionais sobre o lote/sucata</label>
          <textarea 
            placeholder="Ex: Motor fundido, mas lataria e câmbio em perfeito estado. Baixa definitiva em andamento."
            className={`${inputClass} min-h-[120px] resize-none`}
            {...register('observacoes')}
          />
          {errors.observacoes && <p className="text-red-500 text-xs mt-1.5">{errors.observacoes.message}</p>}
        </div>

      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h4 className="text-emerald-500 font-medium">Tudo pronto!</h4>
          <p className="text-emerald-500/80 text-sm">Placa informada: <span className="font-mono uppercase">{placa || 'N/A'}</span></p>
        </div>
      </div>

    </div>
  );
}
