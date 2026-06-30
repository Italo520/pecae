'use client';

import { useState } from 'react';

interface ContactCTAProps {
  whatsapp?: string;
  sellerName: string;
}

export function ContactCTA({ whatsapp, sellerName }: ContactCTAProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleContact = () => {
    // Aqui no futuro podemos verificar se está logado e iniciar o chat interno.
    // Por enquanto, apenas exibimos o WhatsApp.
    if (!isRevealed) {
      setIsRevealed(true);
      return;
    }

    if (whatsapp) {
      const message = encodeURIComponent(`Olá ${sellerName}, vi seu anúncio no PECAÊ e tenho interesse.`);
      window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
    } else {
      alert('Iniciar Chat Interno com o vendedor (Feature futura)');
    }
  };

  return (
    <div className="w-full mt-6">
      <button
        onClick={handleContact}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        {isRevealed && whatsapp ? whatsapp : 'Entrar em Contato'}
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
        A PECAÊ não cobra taxa sobre a venda.
      </p>
    </div>
  );
}
