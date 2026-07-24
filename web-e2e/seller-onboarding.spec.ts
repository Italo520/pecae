import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
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
    return '';
  }
}

test.describe('PECAÊ E2E - Onboarding de Vendedor', () => {
  test.use({ baseURL: 'https://pecae.italohub.cloud' });

  const testEmail = 'onboarding-e2e@pecae.com.br';

  test.beforeEach(async () => {
    // Limpar registros de testes anteriores
    runSqlQuery(`DELETE FROM seller_profiles WHERE user_id = (SELECT id FROM users WHERE email = '${testEmail}');`);
    runSqlQuery(`DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email = '${testEmail}');`);
    runSqlQuery(`DELETE FROM email_verification_tokens WHERE user_id = (SELECT id FROM users WHERE email = '${testEmail}');`);
    runSqlQuery(`DELETE FROM terms_acceptances WHERE user_id = (SELECT id FROM users WHERE email = '${testEmail}');`);
    runSqlQuery(`DELETE FROM users WHERE email = '${testEmail}';`);
  });

  test('Deve realizar o cadastro e onboarding completo do vendedor', async ({ page }) => {
    test.setTimeout(120000);
    console.log('▶️ Iniciando Teste de Onboarding de Vendedor...');

    // 1. Criar o usuário via API (Simulando registro básico)
    let registerResponse = await page.request.post('https://api-pecae.italohub.cloud/api/v1/auth/register', {
      data: {
        name: 'Vendedor Onboarding E2E',
        email: testEmail,
        password: 'Pecae@E2e123',
        type: 'SELLER',
        termsAccepted: true,
        privacyAccepted: true,
      },
      failOnStatusCode: false
    });
    console.log(`ℹ️ User registration API response status: ${registerResponse.status()}`);

    // 2. Bypass de e-mail e redefinição de senha no banco remoto
    runSqlQuery(`
      UPDATE users 
      SET email_verified = true, 
          status = 'ACTIVE', 
          password_hash = '$2b$10$gfKOsCwR5i8y7i7gdTx7YefZmQL1PK8JeC/1R9qTJcpr7orTrS6.i' 
      WHERE email = '${testEmail}';
    `);

    // 3. Efetuar Login
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // 4. Se o usuário for vendedor e não tiver perfil, a aplicação normalmente deve redirecionar 
    //    ou permitir acesso a /vendedor/onboarding
    await page.waitForTimeout(3000);
    await page.goto('/vendedor/onboarding');
    await page.waitForLoadState('networkidle');

    // 5. Preencher formulário de onboarding
    console.log('📝 Preenchendo formulário de onboarding...');
    
    // Selecionar Tipo
    await page.getByRole('button', { name: 'CONCESSIONÁRIA' }).click();
    
    // CNPJ
    await page.locator('input[placeholder="00.000.000/0000-00"]').fill('12345678000199');
    
    // Nome da loja
    await page.locator('input[placeholder="Ex: Ferro Velho do Juca"]').fill('Loja E2E Auto Peças');
    
    // Descrição
    await page.locator('textarea[placeholder="Conte sobre suas especialidades..."]').fill('Loja especializada em peças de veículos E2E');
    
    // Telefones
    await page.locator('input[placeholder="(00) 0000-0000"]').fill('1133334444');
    await page.locator('input[placeholder="(00) 90000-0000"]').fill('11999998888');
    
    // Endereço (Campo crítico que estava falhando no DB)
    await page.locator('input[placeholder="Rua, número, bairro..."]').fill('Rua Teste E2E, 123');
    await page.locator('input[placeholder="Ex: São Paulo"]').fill('São Paulo');
    await page.locator('input[placeholder="SP"]').fill('SP');
    
    // Horário
    await page.locator('input[placeholder="Ex: Seg-Sex: 08:00 - 18:00"]').fill('Seg-Sex: 08:00 - 18:00');
    
    // 6. Submeter formulário
    await page.getByRole('button', { name: /PRÓXIMO: VERIFICAÇÃO/i }).click();

    // 7. Aguardar redirecionamento para solicitar-verificacao
    await page.waitForURL('**/vendedor/solicitar-verificacao', { timeout: 15000 });
    console.log('✅ Perfil comercial criado com sucesso! Redirecionado para verificação.');
    
    await expect(page.locator('text=VERIFICAÇÃO KYC')).toBeVisible({ timeout: 10000 });
    console.log('🎉 Teste de Onboarding concluído com sucesso!');
  });
});
