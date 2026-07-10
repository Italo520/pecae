import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

// Função auxiliar para rodar queries SQL via bridge pg
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

test.describe('PECAÊ E2E - Fluxo de Cadastro e Moderação de Veículo', () => {

  test.beforeEach(async () => {
    // Limpar veículos antigos cadastrados de teste
    runSqlQuery("DELETE FROM listings WHERE title LIKE 'Moderação E2E%';");
    runSqlQuery("DELETE FROM vehicles WHERE observations LIKE 'Observação E2E%';");
  });

  test('Deve cadastrar veículo como vendedor, aprovar via API de moderador e validar ativo na home', async ({ page }) => {
    const timestamp = Date.now();
    const titleVal = `Moderação E2E - Gol 1.0 - ${timestamp}`;
    const obsVal = `Observação E2E - Moderação Teste ${timestamp}`;

    console.log(`🚀 Iniciando teste de cadastro e moderação para: ${titleVal}`);

    page.on('console', msg => {
      console.log(`[Browser Log] ${msg.text()}`);
    });

    // 1. Login do Vendedor
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('seller-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();

    await page.waitForURL('**/vendedor/dashboard', { timeout: 15000 });
    console.log('✅ Vendedor logado.');

    // 2. Acessar formulário de anúncio
    await page.goto('/vendedor/anunciar');
    await page.waitForLoadState('domcontentloaded');

    const plateVal = `E2E${Math.floor(Math.random() * 9 + 1)}A${Math.floor(Math.random() * 90 + 10)}`;
    console.log(`ℹ️ Placa gerada para o veículo: ${plateVal}`);

    // Passo 1: Identificação
    await page.locator('input[placeholder*="ABC-1234"]').fill(plateVal);
    await page.locator('input[placeholder*="Prata"]').fill('Azul');
    await page.locator('input[placeholder="0"]').fill('12000');
    await page.locator('select').first().selectOption('FLEX');
    await page.locator('input[placeholder*="São Paulo"]').fill('Santos');
    await page.locator('input[placeholder="SP"]').fill('SP');

    await page.locator('button:has-text("Próximo Passo")').click();
    await page.waitForTimeout(1000);
    console.log('✅ Passo 1 preenchido.');

    // Passo 2: Tabela FIPE (seletores de marca, modelo, versão, ano)
    const selectBrand = page.locator('select').nth(0);
    await selectBrand.selectOption({ label: 'Volkswagen' });

    const selectModel = page.locator('select').nth(1);
    await selectModel.locator('option:has-text("Gol")').waitFor({ state: 'attached', timeout: 15000 });
    await selectModel.selectOption({ label: 'Gol' });

    const selectVersion = page.locator('select').nth(2);
    await selectVersion.locator('option:has-text("1.0 MI 8V")').waitFor({ state: 'attached', timeout: 15000 });
    await selectVersion.selectOption({ label: '1.0 MI 8V' });

    const selectYear = page.locator('select').nth(3);
    const yearOption = selectYear.locator('option:has-text("2012")').first();
    await yearOption.waitFor({ state: 'attached', timeout: 15000 });
    const yearValue = await yearOption.getAttribute('value') || '';
    await selectYear.selectOption(yearValue);

    await page.locator('button:has-text("Próximo Passo")').click();
    await page.waitForTimeout(1000);
    console.log('✅ Passo 2 preenchido.');

    // Passo 3: Peças
    await page.locator('button:has-text("Próximo Passo")').click();
    await page.waitForTimeout(1000);
    console.log('✅ Passo 3 avançado.');

    // Passo 4: Fotos
    await page.locator('button:has-text("Próximo Passo")').click();
    await page.waitForTimeout(1000);
    console.log('✅ Passo 4 avançado.');

    // Injetar título e observações no Zustand antes da finalização
    // Não usamos mais Zustand no Next.js (dados vão via formulário real do react-hook-form)
    
    // Passo 5: Preço e Finalização
    await page.locator('textarea[placeholder*="Ex: Motor fundido"]').fill(obsVal);
    console.log('✅ Passo 5 preenchido.');

    const finalizeBtn = page.locator('button:has-text("Finalizar e Anunciar")').first();
    await finalizeBtn.click();
    
    // Aguarda o redirecionamento automático para o dashboard
    await page.waitForURL('**/vendedor/dashboard', { timeout: 25000 });
    console.log('✅ Veículo cadastrado com sucesso pelo vendedor.');

    // 3. Obter o ID do anúncio cadastrado do banco de dados
    const listingId = runSqlQuery(`SELECT l.id FROM listings l JOIN vehicles v ON l.vehicle_id = v.id WHERE v.observations = '${obsVal}';`);
    console.log(`ℹ️ Listing ID cadastrado: ${listingId}`);
    expect(listingId).not.toBe('');

    // Obter o título gerado pelo backend
    const generatedTitle = runSqlQuery(`SELECT title FROM listings WHERE id = '${listingId}';`);
    console.log(`ℹ️ Título gerado pelo backend: ${generatedTitle}`);
    expect(generatedTitle).not.toBe('');

    // Efetuar logout no browser
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const context = page.context();
    await context.clearCookies();
    await page.reload();

    // 4. Aprovação via API com autenticação de Moderador
    const modToken = await page.evaluate(async () => {
      const loginRes = await fetch('http://localhost:3333/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'moderator-e2e@pecae.com.br', password: 'Pecae@E2e123' })
      });
      const data = await loginRes.json();
      return data.tokens.accessToken;
    });

    const approveStatus = await page.evaluate(async ({ id, token }) => {
      const res = await fetch(`http://localhost:3333/api/v1/moderacao/anuncios/${id}/decisao`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          acao: 'APROVAR_ANUNCIO',
          motivo: 'Aprovado via teste automatizado E2E'
        })
      });
      return res.status;
    }, { id: listingId, token: modToken });

    console.log(`ℹ️ Status da resposta de aprovação do moderador: ${approveStatus}`);
    expect([200, 201, 204]).toContain(approveStatus);
    console.log('✅ Veículo aprovado pela API de moderação.');

    // 5. Validar na Home que o anúncio está publicado e visível para compradores
    await page.goto('/');
    
    const listingCard = page.locator(`text=${generatedTitle}`).first();
    await expect(listingCard).toBeVisible({ timeout: 15000 });
    console.log('✅ Validação Final: Veículo aprovado e ativo está visível publicamente na home do comprador.');
  });
});
