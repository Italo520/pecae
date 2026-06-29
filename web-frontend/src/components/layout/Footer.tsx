import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2" aria-label="Home PECAÊ">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--brand)] flex items-center justify-center text-white font-bold text-xl leading-none">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                PECAÊ
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)]">
              O marketplace definitivo de peças automotivas.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--foreground)]">Sobre</h3>
            <Link href="/sobre" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Quem somos
            </Link>
            <Link href="/contato" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Contato
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--foreground)]">Legal</h3>
            <Link href="/termos" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Privacidade
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[var(--foreground)]">Ajuda</h3>
            <Link href="/faq" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Perguntas Frequentes
            </Link>
            <Link href="/dicas-seguranca" className="text-sm text-[var(--muted)] hover:text-[var(--brand)] transition-colors">
              Dicas de Segurança
            </Link>
          </div>

        </div>
        
        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)] text-center md:text-left">
            &copy; {currentYear} PECAÊ. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
