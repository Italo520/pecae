'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sellerService } from '@/services/seller.service';
import { WizardStepper } from '@/components/ui/WizardStepper';
import { DocumentUpload } from '@/components/vendedor/DocumentUpload';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface FileWithPreview extends File {
  preview: string;
}

export default function SolicitarVerificacaoPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Revogar object URLs para evitar memory leaks
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await sellerService.getVerificationStatus();
        setStatus(data);
      } catch (error) {
        console.error('Erro ao buscar status', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    if (files.length === 0) {
      setErrorMsg('Selecione pelo menos um documento.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      // 1. Solicita URLs assinadas passando a quantidade exata de arquivos
      const slots = await sellerService.requestUploadSlots(files.length);

      // Validação defensiva: verificar se os slots de upload retornados são suficientes
      if (!slots || slots.length < files.length) {
        throw new Error('Não foi possível obter slots de upload suficientes.');
      }

      // 2. Upload paralelo para o Storage com checagem de cada slot
      const uploadResults = await Promise.all(
        files.map(async (doc, index) => {
          const slot = slots[index];
          if (!slot) {
            throw new Error(`Slot de upload não encontrado para o arquivo: ${doc.name}`);
          }
          if (slot.uploadUrl) {
            await sellerService.uploadFileToSlot(doc, slot.uploadUrl);
          }
          return slot.path;
        })
      );

      // 3. Confirma a solicitação na API
      await sellerService.confirmVerification(uploadResults);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um problema ao enviar seus documentos.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3FFF8B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const latest = status?.latestVerification;

  if (latest?.status === 'PENDING' || latest?.status === 'PENDENTE') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-gray-900/60 p-10 rounded-3xl border border-gray-800 backdrop-blur-sm">
          <Clock className="w-20 h-20 text-[#3FFF8B] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Verificação em Análise</h2>
          <p className="text-gray-400 mb-8">
            Nossa equipe está revisando seus documentos. Você será notificado assim que o processo for concluído.
          </p>
          <button
            onClick={() => router.push('/vendedor/dashboard')}
            className="w-full bg-transparent border-2 border-gray-700 hover:border-gray-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            VOLTAR AO PAINEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#3FFF8B]/10 px-3 py-1 rounded text-[#3FFF8B] text-xs tracking-widest font-mono mb-4">
            <span className="w-1.5 h-1.5 bg-[#3FFF8B] rounded-full"></span>
            SELLER_ONBOARDING
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">SELO DE VERIFICADO</h1>
          <p className="text-gray-400">Vendedores verificados têm maior destaque nas buscas e passam mais confiança.</p>
        </div>

        <WizardStepper currentStep={2} steps={['Dados da Loja', 'Verificação KYC', 'Concluído']} />

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-[#3FFF8B]" />
              Documentos Necessários
            </h3>
            <ul className="space-y-3 text-gray-300 ml-8 list-disc">
              <li>Documento de Identidade (RG ou CNH)</li>
              <li>Comprovante de CNPJ (Se PJ)</li>
              <li>Selfie segurando o documento</li>
            </ul>
          </div>

          <div className="border-t border-gray-800 my-6"></div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
              <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Anexar Documentos</h3>
            <DocumentUpload files={files} setFiles={setFiles} maxFiles={5} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isUploading || files.length === 0}
            className="w-full bg-[#3FFF8B] hover:bg-[#32e078] text-black font-extrabold tracking-wide py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(63,255,139,0.3)] disabled:opacity-50 flex items-center justify-center"
          >
            {isUploading ? 'ENVIANDO...' : 'ENVIAR PARA ANÁLISE'}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#3FFF8B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#3FFF8B]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Solicitação Enviada!</h2>
            <p className="text-gray-400 text-sm mb-8">
              Seus documentos foram recebidos e serão analisados em até 48 horas. Você será notificado sobre o resultado.
            </p>
            <button
              onClick={() => router.push('/vendedor/dashboard')}
              className="w-full bg-[#3FFF8B] hover:bg-[#32e078] text-black font-bold py-3 rounded-xl transition-colors"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
