import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Acesso Negado | PECAÊ',
};

export default function AcessoNegadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-display font-semibold text-white mb-4">
        Acesso Restrito
      </h1>
      
      <p className="text-white/60 max-w-md mb-8">
        Esta área é exclusiva para Vendedores e Lojistas cadastrados na plataforma. 
        O seu perfil atual de Comprador não permite o acesso a recursos de gestão de estoque.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
        <Link 
          href="/perfil"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black font-semibold rounded-xl transition-colors"
        >
          <span>Acessar Meu Perfil</span>
        </Link>
      </div>
    </div>
  );
}
