import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as path from 'path';

function runSqlQuery(sql: string): string {
  try {
    const scriptPath = path.resolve(__dirname, '../e2e/helpers/query.js');
    const command = `node "${scriptPath}"`;
    return execSync(command, { input: sql, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (error: any) {
    console.error(`[SQL ERROR] Falha ao rodar query: ${sql}`);
    return '';
  }
}

test.describe('PECAÊ E2E - Módulo de Campanhas/Ads', () => {
  let anuncianteId = crypto.randomUUID();

  test.beforeAll(async () => {
    // Insere um anunciante mockado no banco para o teste de criação de campanha
    const sql = `
      INSERT INTO advertisers (id, nome_empresa, nome_contato, email_contato, telefone_contato, ativo, created_at, updated_at)
      VALUES ('${anuncianteId}', 'Seguradora Auto E2E', 'Contato Seguradora', 'contato@seguradora-e2e.com', '11999999999', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    runSqlQuery(sql);
  });

  test('Deve criar uma campanha como Moderador e visualizá-la na Home como Comprador', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Add debug listeners
    page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('[BROWSER ERROR]', error.message));

    // 1. Login do Moderador
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.waitForTimeout(1000);
    await page.locator('button', { hasText: /Entrar|Login/i }).click();
    await page.waitForURL('**/moderador/dashboard', { timeout: 15000 });

    // 2. Acessar tela de campanhas
    await page.goto('/moderador/campanhas');
    await page.waitForTimeout(3000);

    // 3. Abrir modal e preencher (retentativa caso a hidratação atrase)
    const btnNovaCampanha = page.getByRole('button', { name: 'Nova Campanha' });
    await btnNovaCampanha.waitFor({ state: 'visible' });
    await btnNovaCampanha.click();
    
    // Fallback locator for the modal to be robust
    const modalTitle = page.getByText('Nova Campanha Patrocinada');
    try {
      await expect(modalTitle).toBeVisible({ timeout: 5000 });
    } catch {
      // If it failed, maybe hydration missed the click. Click again.
      await btnNovaCampanha.click();
      await expect(modalTitle).toBeVisible({ timeout: 5000 });
    }
    const bannerImageUrl = 'https://via.placeholder.com/1200x250?text=Seguro+Auto+Total+-+Proteja+seu+Veiculo';
    const bannerLink = 'https://pecae.com.br/promo-seguro';

    await page.locator('input#nome').fill('Campanha Seguro Automotivo');
    await page.locator('input#anuncianteId').fill(anuncianteId);
    
    // Calcula uma data futura para o dataFim
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 30);
    const dataFimStr = dataFim.toISOString().split('T')[0];
    await page.locator('input#dataFim').fill(dataFimStr);

    await page.locator('input#orcamentoTotal').fill('1500.00');
    await page.locator('input#urlImagem').fill(bannerImageUrl);
    await page.locator('input#urlDestino').fill(bannerLink);
    await page.waitForTimeout(1000);

    // 4. Submeter
    await page.getByRole('button', { name: 'Lançar Campanha' }).click();
    // Wait for modal to close instead of waiting for toast (sometimes toast is fast or occluded)
    await expect(modalTitle).toBeHidden({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // 5. Deslogar
    await page.goto('/login'); 
    await context.clearCookies();

    // 6. Visualizar a Home como visitante (público)
    await page.goto('/');
    
    // 7. O Banner Patrocinado deve estar visível no carrossel
    // No Next.js o next/image altera o atributo src para /_next/image?url=...
    const bannerImage = page.locator(`img[src*="${encodeURIComponent(bannerImageUrl)}"], img[src="${bannerImageUrl}"]`);
    await expect(bannerImage.first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(5000); // 5 segundos na home para visualizar o banner

    console.log('✅ Banner E2E renderizado com sucesso na página pública!');
    await context.close();
  });
});
