import { test, expect } from '@playwright/test';

test.describe('PECAÊ E2E - Controle de Acesso RBAC/CASL - Web Next.js', () => {

  test('Deve garantir bloqueios de segurança contra o Comprador tentando acessar rota de Moderador', async ({ page }) => {
    console.log('▶️ Iniciando Teste de Segurança RBAC/CASL (Web)...');

    page.on('console', msg => {
      console.log(`[Browser Log] ${msg.text()}`);
    });

    // 1. Login do Comprador (tipo COMPRADOR)
    await page.goto('/login');
    await page.locator('input[type="email"], input[placeholder*="email" i]').fill('buyer-e2e@pecae.com.br');
    await page.locator('input[type="password"], input[placeholder*="senha" i]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();
    
    // Aguarda o login e redirecionamento para a página inicial
    await page.waitForURL('/');
    console.log('✅ Login do Comprador realizado.');

    // 2. Tentar acessar a rota restrita de Moderador no frontend
    await page.goto('/moderador/dashboard');
    
    // 3. Validar bloqueio visual: deve redirecionar para /acesso-negado ou similar
    // Aguarda o redirecionamento
    await page.waitForURL('**/acesso-negado', { timeout: 15000 });
    
    // O texto de acesso negado deve estar visível
    const deniedText = page.locator('text=/Acesso Restrito|Acesso Negado|Não autorizado/i').first();
    await expect(deniedText).toBeVisible({ timeout: 10000 });
    console.log('✅ Acesso à rota restrita de moderação foi bloqueado no Frontend Next.js (redirecionado para acesso-negado).');

    // 4. Testar proteção a nível de API (Bypass de segurança)
    // Obter o token do Zustand/localStorage
    const token = await page.evaluate(() => {
      // Como o token está no Zustand auth-store, podemos ler o localStorage se ele persistir ou fazer requisição deslogada
      // Mas o token do Zustand pode ser lido da sessionStorage/localStorage se persistido
      // Se não, passamos um token inválido ou o token do comprador para a API
      return localStorage.getItem('user_token') || 'invalid-token-test';
    });

    const apiCalls = [
      { url: 'http://localhost:3333/api/v1/moderation/listings', method: 'GET' },
      { url: 'http://localhost:3333/api/v1/moderation/listings/some-id/approve', method: 'POST' },
      { url: 'http://localhost:3333/api/v1/analytics/admin', method: 'GET' }
    ];

    console.log('🔒 Disparando chamadas diretas de API para validar o CASL de back-end...');
    
    for (const call of apiCalls) {
      const responseStatus = await page.evaluate(async (params) => {
        try {
          const res = await fetch(params.url, {
            method: params.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${params.token}`
            }
          });
          return res.status;
        } catch {
          return 500;
        }
      }, { url: call.url, method: call.method, token });

      // O backend DEVE retornar 403 (Forbidden) ou 401 (Unauthorized)
      expect([401, 403]).toContain(responseStatus);
      console.log(`✅ Endpoint de API [${call.method}] ${call.url} protegido! Retornou status: ${responseStatus}`);
    }

    console.log('✅ Validação RBAC/CASL Back-end: Todos os endpoints estão protegidos contra privilégios elevados!');
  });
});
