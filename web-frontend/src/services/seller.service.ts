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
      sellerType: data.type
    };

    const response = await apiClient.post('/sellers/me', payload);
    return response.data;
  },

  getVerificationStatus: async () => {
    const response = await apiClient.get('/sellers/verification/status');
    return response.data;
  },

  requestUploadSlots: async () => {
    const response = await apiClient.post('/sellers/verification/request');
    return response.data; // Retorna { data: slots }
  },

  uploadFileToSlot: async (file: File, uploadUrl: string) => {
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
  },

  confirmVerification: async (documentUrls: string[]) => {
    const response = await apiClient.post('/sellers/verification/confirm', {
      documentUrls,
    });
    return response.data;
  }
};
