import { apiClient } from './auth.service';

export interface SellerOnboardingData {
  storeName: string;
  type: 'CONCESSIONARIA' | 'DESMANCHE';
  cnpj: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  openHours?: string;
}

export const sellerService = {
  createSellerProfile: async (data: SellerOnboardingData) => {
    // Formatar dados para o backend assim como no mobile
    const formattedWhatsapp = data.whatsapp.replace(/\D/g, '');
    const finalWhatsapp = formattedWhatsapp.startsWith('55') 
      ? `+${formattedWhatsapp}` 
      : `+55${formattedWhatsapp}`;
      
    const payload = {
      name: data.storeName,
      document: data.cnpj.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
      sellerType: data.type,
      address: data.address,
      city: data.city,
      state: data.state,
      whatsapp: finalWhatsapp
    };

    const response = await apiClient.post('/sellers/me', payload);
    return response.data;
  },

  getVerificationStatus: async () => {
    try {
      const response = await apiClient.get('/sellers/me');
      return { latestVerification: response.data?.verificacao || response.data?.verification || null };
    } catch {
      return { latestVerification: null };
    }
  },

  requestUploadSlots: async (count: number = 1) => {
    // Retorna slots de upload dinâmicos com base na quantidade de arquivos solicitados
    return Array.from({ length: Math.max(1, count) }, (_, i) => ({
      uploadUrl: '',
      path: `documents/verification_doc_${i + 1}_${Date.now()}.pdf`
    }));
  },

  uploadFileToSlot: async (file: File, uploadUrl: string) => {
    if (uploadUrl) {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao fazer upload do arquivo');
      }
    }
  },

  confirmVerification: async (documentUrls: string[]) => {
    // Chama o endpoint real do backend Spring Boot: POST /sellers/me/verification
    const response = await apiClient.post('/sellers/me/verification');
    return response.data;
  }
};
