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
    // Limpar registros de testes anteriores
    runSqlQuery("DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM email_verification_tokens WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM terms_acceptances WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM seller_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br');");
    runSqlQuery("DELETE FROM users WHERE email = 'novo-vendedor-e2e@pecae.com.br';");
  });

  test('Deve registrar um novo vendedor, aplicar bypass de e-mail, logar e verificar o perfil', async ({ page }) => {
    console.log('▶️ Iniciando Teste de Identidade e Registro de Vendedor (Web)...');

    // 1. Criar o usuário via API REST diretamente (porta 3333 do Java backend)
    const registerResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:3333/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Novo Vendedor E2E',
            email: 'novo-vendedor-e2e@pecae.com.br',
            password: 'Pecae@E2e123',
            type: 'SELLER',
            termsAccepted: true,
          }),
        });
        return { status: res.status, ok: res.ok };
      } catch (e: any) {
        return { status: 0, ok: false, error: e.message };
      }
    });

    console.log(`ℹ️ Registro de vendedor via API: status=${registerResponse.status}`);
    expect([201, 409]).toContain(registerResponse.status);

    // 2. Bypass de e-mail, ativação e reset de senha do usuário no banco remoto
    runSqlQuery(`
      UPDATE users 
      SET email_verified = true, 
          status = 'ACTIVE', 
          password_hash = '$2b$10$gfKOsCwR5i8y7i7gdTx7YefZmQL1PK8JeC/1R9qTJcpr7orTrS6.i' 
      WHERE email = 'novo-vendedor-e2e@pecae.com.br';
    `);
    console.log('✅ Bypass de verificação de e-mail e redefinição de senha aplicados no banco.');

    // 3. Efetuar Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('novo-vendedor-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Aguarda o redirecionamento pós-login (vai para o Dashboard do Vendedor)
    await page.waitForURL('**/vendedor/dashboard', { timeout: 15000 });
    console.log('✅ Login realizado com sucesso.');

    // 4. Acessar o Perfil e Validar o tipo da conta
    await page.goto('/perfil');
    
    // O nome do usuário e o tipo de conta devem ser exibidos corretamente
    await expect(page.locator('text=Novo Vendedor E2E')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=SELLER')).toBeVisible({ timeout: 10000 });
    console.log('✅ Perfil de Vendedor (SELLER) validado com sucesso.');

    // 5. Efetuar Logout
    await page.getByRole('button', { name: /Sair da conta/i }).click();
    await page.waitForURL('**/', { timeout: 10000 });
    console.log('✅ Logout concluído com sucesso.');
  });
});
