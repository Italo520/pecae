'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sellerService, SellerOnboardingData } from '@/services/seller.service';
import { WizardStepper } from '@/components/ui/WizardStepper';
import { Building2, MapPin, Phone, Clock, FileText } from 'lucide-react';

const sellerSchema = z.object({
  storeName: z.string().min(3, 'Nome da loja deve ter pelo menos 3 caracteres'),
  type: z.enum(['CONCESSIONARIA', 'DESMANCHE']),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  description: z.string().min(10, 'Descreva sua loja (mínimo 10 caracteres)'),
  phone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado (UF) deve ter 2 letras'),
  openHours: z.string().optional(),
});

export default function OnboardingPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<SellerOnboardingData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      type: 'CONCESSIONARIA',
    }
  });

  const selectedType = watch('type');

  const onSubmit = async (data: SellerOnboardingData) => {
    try {
      setErrorMsg('');
      await sellerService.createSellerProfile(data);
      // Sucesso: vai para a próxima etapa do wizard
      router.push('/vendedor/solicitar-verificacao');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao criar perfil comercial.');
    }
  };

  const inputBaseClasses = "block w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl py-3 text-gray-900 dark:text-white focus:ring-[#32e078] dark:focus:ring-[#3FFF8B] focus:border-[#32e078] dark:focus:border-[#3FFF8B] transition-colors";
  const labelClasses = "block text-xs text-gray-700 dark:text-gray-400 font-semibold mb-1";
  const iconClasses = "h-5 w-5 text-gray-400 dark:text-gray-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#3FFF8B]/10 px-3 py-1 rounded text-[#059669] dark:text-[#3FFF8B] text-xs tracking-widest font-mono mb-4 font-bold border border-[#3FFF8B]/20">
            <span className="w-1.5 h-1.5 bg-[#059669] dark:bg-[#3FFF8B] rounded-full"></span>
            SELLER_ONBOARDING
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">PERFIL COMERCIAL</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Configure os detalhes da sua loja para começar a anunciar no ecossistema PECAÊ.</p>
        </div>

        <WizardStepper currentStep={1} steps={['Dados da Loja', 'Verificação KYC', 'Concluído']} />

        <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl dark:shadow-2xl transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-700 dark:text-gray-400 mb-3 tracking-wider">TIPO DE OPERAÇÃO (PJ)</label>
              <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setValue('type', 'CONCESSIONARIA')}
                  className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-lg transition-all duration-300 ${
                    selectedType === 'CONCESSIONARIA' ? 'bg-white dark:bg-gray-800 text-[#059669] dark:text-[#3FFF8B] shadow border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  CONCESSIONÁRIA
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'DESMANCHE')}
                  className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-lg transition-all duration-300 ${
                    selectedType === 'DESMANCHE' ? 'bg-white dark:bg-gray-800 text-[#059669] dark:text-[#3FFF8B] shadow border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  DESMANCHE
                </button>
              </div>
            </div>

            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <div>
                  <label className={labelClasses}>CNPJ DA OPERAÇÃO</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className={iconClasses} />
                    </div>
                    <input
                      {...field}
                      className={`${inputBaseClasses} pl-10`}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>}
                </div>
              )}
            />

            <Controller
              control={control}
              name="storeName"
              render={({ field }) => (
                <div>
                  <label className={labelClasses}>NOME DA LOJA / DESMONTE</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className={iconClasses} />
                    </div>
                    <input
                      {...field}
                      className={`${inputBaseClasses} pl-10`}
                      placeholder="Ex: Ferro Velho do Juca"
                    />
                  </div>
                  {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>}
                </div>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <div>
                  <label className={labelClasses}>DESCRIÇÃO DA OPERAÇÃO</label>
                  <textarea
                    {...field}
                    rows={3}
                    className={`${inputBaseClasses} p-3 resize-none`}
                    placeholder="Conte sobre suas especialidades..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <div>
                    <label className={labelClasses}>TELEFONE</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={iconClasses} />
                      </div>
                      <input
                        {...field}
                        type="tel"
                        className={`${inputBaseClasses} pl-10`}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="whatsapp"
                render={({ field }) => (
                  <div>
                    <label className={labelClasses}>WHATSAPP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={iconClasses} />
                      </div>
                      <input
                        {...field}
                        type="tel"
                        className={`${inputBaseClasses} pl-10`}
                        placeholder="(00) 90000-0000"
                      />
                    </div>
                    {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                  </div>
                )}
              />
            </div>

            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <div>
                  <label className={labelClasses}>ENDEREÇO COMPLETO</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className={iconClasses} />
                    </div>
                    <input
                      {...field}
                      className={`${inputBaseClasses} pl-10`}
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <div>
                      <label className={labelClasses}>CIDADE</label>
                      <input
                        {...field}
                        className={`${inputBaseClasses} px-3`}
                        placeholder="Ex: São Paulo"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                  )}
                />
              </div>
              <div>
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <div>
                      <label className={labelClasses}>UF</label>
                      <input
                        {...field}
                        maxLength={2}
                        className={`${inputBaseClasses} px-3 uppercase`}
                        placeholder="SP"
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                  )}
                />
              </div>
            </div>

            <Controller
              control={control}
              name="openHours"
              render={({ field }) => (
                <div>
                  <label className={labelClasses}>HORÁRIO DE ATENDIMENTO (OPCIONAL)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className={iconClasses} />
                    </div>
                    <input
                      {...field}
                      className={`${inputBaseClasses} pl-10`}
                      placeholder="Ex: Seg-Sex: 08:00 - 18:00"
                    />
                  </div>
                  {errors.openHours && <p className="text-red-500 text-xs mt-1">{errors.openHours.message}</p>}
                </div>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-[#32e078] dark:bg-[#3FFF8B] hover:bg-[#25c465] dark:hover:bg-[#32e078] text-white dark:text-black font-extrabold tracking-wide py-4 rounded-xl transition-all shadow-lg dark:shadow-[0_0_20px_rgba(63,255,139,0.3)] disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? 'SALVANDO...' : 'PRÓXIMO: VERIFICAÇÃO'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
