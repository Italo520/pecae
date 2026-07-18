export const metadata = {
  title: 'Política de Privacidade — PECAÊ',
  description: 'Leia a Política de Privacidade do PECAÊ para entender como cuidamos dos seus dados.',
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-3xl bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-xl backdrop-blur-md">
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-[var(--foreground)] tracking-tight mb-8 border-b border-[var(--border)] pb-4">
          Política de Privacidade
        </h1>
        
        <div className="space-y-6 text-[var(--foreground)]/80 leading-relaxed text-sm md:text-base">
          <p>
            O <strong>PECAÊ</strong> valoriza sua privacidade e está empenhado em proteger seus dados pessoais em plena conformidade com a Lei Geral de Proteção de Dados (LGPD) brasileira.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">1. Quais dados coletamos?</h2>
          <p>
            Coletamos dados fornecidos diretamente por você no cadastro (nome, e-mail, telefone, avatar), dados de anúncios cadastrados, mensagens trocadas no chat de negociação, e dados de navegação/cookies para melhoria do desempenho técnico.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">2. Finalidade da Coleta</h2>
          <p>
            Os dados coletados são utilizados para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Autenticação de identidade e segurança da conta;</li>
            <li>Habilitação da troca de mensagens em tempo real entre compradores e vendedores;</li>
            <li>Listagem de anúncios e correspondências com potenciais compradores;</li>
            <li>Envio de notificações de novas mensagens recebidas.</li>
          </ul>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">3. Compartilhamento de Dados</h2>
          <p>
            Não vendemos seus dados a terceiros. Seus dados de contato (como telefone) ou anúncios são exibidos de forma controlada conforme você ativa a divulgação na plataforma. Dados também podem ser partilhados para cumprimento de obrigações legais ou de moderação de fraudes.
          </p>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">4. Direitos do Titular (LGPD)</h2>
          <p>
            Em conformidade com a LGPD, você possui direito de:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Confirmar a existência do tratamento de seus dados;</li>
            <li>Solicitar acesso, correção ou eliminação de seus dados pessoais armazenados;</li>
            <li>Revogar o consentimento a qualquer momento (o que pode impedir a continuidade do uso de alguns serviços).</li>
          </ul>

          <h2 className="text-xl font-bold font-display text-[var(--foreground)] pt-4">5. Segurança da Informação</h2>
          <p>
            Implementamos controles rígidos de segurança, incluindo encriptação de senhas e uso de HTTPS, para impedir acessos não autorizados ou vazamentos.
          </p>

          <p className="text-xs text-[var(--muted)] pt-8 border-t border-[var(--border)] mt-8">
            Última atualização: 18 de Julho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
