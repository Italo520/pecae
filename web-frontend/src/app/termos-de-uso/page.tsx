export const metadata = {
  title: 'Termos de Uso — PECAÊ',
  description: 'Leia os Termos de Uso do PECAÊ antes de utilizar nossos serviços.',
};

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-3xl bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-xl backdrop-blur-md">
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-[var(--foreground)] tracking-tight mb-8 border-b border-[var(--border)] pb-4">
          Termos de Uso
        </h1>
        
        <div className="space-y-6 text-[var(--foreground)]/80 leading-relaxed text-sm md:text-base">
          <p>
            Bem-vindo ao <strong>PECAÊ</strong>. Ao acessar ou utilizar nossa plataforma (web e mobile), você concorda integralmente em cumprir e estar vinculado aos seguintes Termos de Uso.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">1. Descrição do Serviço</h2>
          <p>
            O PECAÊ é um marketplace que facilita a conexão entre vendedores de sucatas/veículos doadores e compradores de peças de reposição automotivas usadas. O PECAÊ não é proprietário, não vende e não garante a qualidade das peças anunciadas pelos vendedores terceiros.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">2. Cadastro de Usuário</h2>
          <p>
            Para usufruir de certas funcionalidades como publicar anúncios ou enviar mensagens no chat, você deve criar uma conta informando dados reais e completos. É sua responsabilidade manter a confidencialidade de sua senha e conta.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">3. Obrigações e Condutas do Usuário</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Vendedores devem anunciar apenas sucatas com procedência legal e documentação em conformidade com as leis vigentes.</li>
            <li>É proibido anunciar peças provenientes de roubo, furto ou sem a devida rastreabilidade.</li>
            <li>Comportamentos abusivos, ofensivos ou fraudes no chat resultarão no banimento imediato da conta.</li>
          </ul>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">4. Propriedade Intelectual</h2>
          <p>
            Todo o design, código, logotipos e conteúdo proprietário do PECAÊ são protegidos por direitos autorais e marcas registradas. O uso não autorizado é estritamente proibido.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">5. Limitação de Responsabilidade</h2>
          <p>
            O PECAÊ não se responsabiliza por perdas e danos resultantes de negociações entre compradores e vendedores, nem pela autenticidade dos dados fornecidos por terceiros. Recomendamos realizar transações com cuidado e segurança.
          </p>

          <p className="text-xs text-[var(--muted)] pt-8 border-t border-[var(--border)] mt-8">
            Última atualização: 18 de Julho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
