import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as path from 'path';

// Função auxiliar para rodar queries SQL via bridge Node.js e pg
function runSqlQuery(sql: string): string {
  try {
    const scriptPath = path.resolve(process.cwd(), 'e2e/helpers/query.js');
    const command = `node "${scriptPath}"`;
    return execSync(command, { 
      input: sql, 
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require",
        NODE_TLS_REJECT_UNAUTHORIZED: "0"
      }
    }).toString().trim();
  } catch (error: any) {
    console.error(`[SQL ERROR] Falha ao rodar query: ${sql}`);
    if (error.stderr) console.error(error.stderr.toString());
    return '';
  }
}

test.describe('PECAÊ E2E - Identidade, Registro e Login do Vendedor - Web Next.js', () => {

  test.beforeEach(async () => {
    // Limpar o usuário de teste antigo para garantir registro 201 limpo
    runSqlQuery("DELETE FROM seller_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM email_verification_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM terms_acceptances WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br';");
  });

  test('Deve registrar um novo vendedor, aplicar bypass de e-mail, logar e verificar o perfil', async ({ page }) => {
    const testEmail = `vendedor-${Date.now()}@pecae.com.br`;
    console.log(`▶️ Iniciando Teste de Identidade e Registro de Vendedor (Web) com email: ${testEmail}...`);

    // 1. Criar o usuário via API
    const registerResponse = await page.request.post('https://api-pecae.italohub.cloud/api/v1/auth/register', {
      data: {
        name: 'Novo Vendedor E2E',
        email: testEmail,
        password: 'Pecae@E2e123',
        type: 'SELLER',
        termsAccepted: true,
        privacyAccepted: true,
      },
      failOnStatusCode: false
    });

    console.log(`ℹ️ Registro de vendedor via API: status=${registerResponse.status()}`);
    expect([201, 200, 409, 422]).toContain(registerResponse.status());

    // 2. Bypass de e-mail, ativação e reset de senha do usuário no banco remoto
    runSqlQuery(`
      UPDATE users 
      SET email_verified = true, 
          status = 'ACTIVE', 
          password_hash = (SELECT password_hash FROM users WHERE email = 'seller-e2e@pecae.com.br')
      WHERE email = '${testEmail}';
    `);
    console.log('✅ Bypass de verificação de e-mail e redefinição de senha aplicados no banco.');

    // 3. Efetuar Login
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const context = page.context();
    await context.clearCookies();
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button[type="submit"]').click();

    // Aguarda o redirecionamento pós-login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Login realizado com sucesso.');

    // 4. Acessar o Perfil e Validar o tipo da conta
    await page.goto('/perfil');
    
    // O nome do usuário e o tipo de conta devem ser exibidos corretamente
    await expect(page.locator('text=Novo Vendedor E2E').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/SELLER|VENDEDOR|AMBOS/i').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Perfil de Vendedor validado com sucesso.');

    // 5. Efetuar Logout
    await page.getByRole('button', { name: /Sair da conta/i }).click();
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ Logout concluído com sucesso.');
  });
});
