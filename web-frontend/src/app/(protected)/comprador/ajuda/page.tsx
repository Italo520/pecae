'use client';

import { LifeBuoy, ChevronDown, Mail, MessageSquare, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FALLBACK_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'Como faço para comprar uma peça?',
    answer: 'Para comprar uma peça, navegue pelo nosso catálogo ou use a barra de busca. Ao encontrar a peça desejada, clique nela para ver os detalhes e inicie uma negociação com o vendedor através do nosso chat.',
    category: 'Comprar',
  },
  {
    id: '2',
    question: 'Como funciona a negociação?',
    answer: 'A negociação é feita diretamente com o vendedor através do chat da PECAÊ. Você pode fazer ofertas, tirar dúvidas sobre a peça e combinar as formas de pagamento e entrega.',
    category: 'Comprar',
  },
  {
    id: '3',
    question: 'Como sei que o vendedor é confiável?',
    answer: 'Todos os vendedores na PECAÊ passam por um rigoroso processo de verificação (KYC). Além disso, você pode ver a avaliação do vendedor e os comentários de outros compradores antes de fechar negócio.',
    category: 'Segurança',
  },
  {
    id: '4',
    question: 'O que fazer se eu tiver um problema com a compra?',
    answer: 'Se você tiver qualquer problema com sua compra, tente primeiro resolver com o vendedor pelo chat. Caso não haja acordo, você pode abrir uma denúncia na página da negociação, e nossa equipe de moderação irá intervir.',
    category: 'Suporte',
  },
];

export default function AjudaCompradorPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faq');
        setFaqs(response.data);
      } catch (error) {
        console.warn('API /faq não encontrada ou indisponível. Usando mock data.');
        setFaqs(FALLBACK_FAQS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] flex items-center justify-center flex-shrink-0 border border-[var(--brand)]/30">
              <LifeBuoy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-1">
                Central de Ajuda
              </h1>
              <p className="text-[var(--muted)]">
                Tire suas dúvidas e aprenda como aproveitar ao máximo a PECAÊ.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <input 
            type="text" 
            placeholder="Buscar por dúvidas (ex: negociação, devolução)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all"
          />
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Perguntas Frequentes</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[var(--surface)] border border-[var(--border)] animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                      isOpen ? "bg-[var(--surface-hover)] border-[var(--border-hover)]" : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <button 
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-medium text-[var(--foreground)]">{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-[var(--muted)] transition-transform duration-200 ${
                        isOpen && "rotate-180"
                      }`} />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-5 pt-2 text-[var(--muted)] leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-[var(--muted)]">Nenhuma dúvida encontrada para &quot;{searchQuery}&quot;.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="bg-gradient-to-br from-[var(--brand)]/20 to-transparent border border-[var(--brand)]/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--brand)]/20 rounded-full blur-xl group-hover:bg-[var(--brand)]/30 transition-colors" />
            <MessageSquare className="w-8 h-8 text-[var(--brand)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Ainda precisa de ajuda?</h3>
            <p className="text-sm text-[var(--muted)] mb-6">Nossa equipe de suporte está pronta para te ajudar via chat em tempo real.</p>
            <button className="px-5 py-2.5 rounded-xl bg-[var(--brand)] text-black font-semibold hover:bg-[var(--brand)]/90 transition-colors inline-flex items-center gap-2 relative z-10">
              Iniciar Chat
            </button>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Outros Canais</h3>
            <div className="space-y-4">
              <a href="mailto:suporte@pecae.com.br" className="flex items-center gap-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--brand)]/50 group-hover:text-[var(--brand)] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-xs text-[var(--muted)]">suporte@pecae.com.br</p>
                </div>
              </a>
              <div className="flex items-center gap-3 text-[var(--muted)] group">
                <div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--brand)]/50 group-hover:text-[var(--brand)] transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-xs text-[var(--muted)]">(11) 99999-9999</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
