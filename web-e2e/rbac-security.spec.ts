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
    
    // Aguarda o login e redirecionamento pós-login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Login do Comprador realizado.');

    // 2. Tentar acessar a rota restrita de Moderador no frontend
    await page.goto('/moderador/dashboard');
    
    // 3. Validar bloqueio visual: deve redirecionar para /acesso-negado ou /moderador/dashboard
    await page.waitForURL((url) => url.pathname.includes('/acesso-negado') || url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Acesso à rota restrita de moderação foi bloqueado no Frontend Next.js.');

    // 4. Testar proteção a nível de API (Bypass de segurança)
    const token = await page.evaluate(() => {
      return localStorage.getItem('user_token') || 'invalid-token-test';
    });

    const apiCalls = [
      { url: 'https://api-pecae.italohub.cloud/api/v1/moderation/listings', method: 'GET' },
      { url: 'https://api-pecae.italohub.cloud/api/v1/moderation/listings/some-id/approve', method: 'POST' },
      { url: 'https://api-pecae.italohub.cloud/api/v1/analytics/admin', method: 'GET' }
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
