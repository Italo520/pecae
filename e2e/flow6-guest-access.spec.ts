import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

// Função auxiliar para rodar queries SQL via bridge Node.js e Prisma
function runSqlQuery(sql: string): string {
  try {
    const scriptPath = path.resolve(__dirname, 'helpers/query.js');
    const command = `node "${scriptPath}"`;
    return execSync(command, { input: sql, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (error: any) {
    console.error(`[SQL ERROR] Falha ao rodar query: ${sql}`);
    if (error.stderr) console.error(error.stderr.toString());
    return '';
  }
}

test.describe('PECAÊ E2E - Fluxo 6: Acesso Deslogado (Guest Access)', () => {
  let publishedVehicleId = '';

  test.beforeAll(async () => {
    // Obter um ID de veículo publicado do banco de dados para testar navegação direta
    publishedVehicleId = runSqlQuery("SELECT v.id FROM vehicles v JOIN listings l ON l.vehicle_id = v.id WHERE l.status = 'PUBLISHED' LIMIT 1;");
    console.log(`ℹ️ [FLOW 6] Veículo Publicado ID para teste de Guest Access: ${publishedVehicleId}`);
    
    if (!publishedVehicleId) {
      console.warn('⚠️ [FLOW 6] Nenhum veículo publicado encontrado no banco de dados. Teste direto de veículo pode falhar.');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Garantir que começamos o teste deslogados
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await expect(page.locator('text=/ENTRAR/i').first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve permitir visualizar a home e acessar detalhes de veículo deslogado', async ({ page }) => {
    // 1. Verificar se a home carrega normalmente e exibe o botão ENTRAR
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // O botão ENTRAR deve estar visível no header
    const loginLink = page.locator('text=/ENTRAR/i').first();
    await expect(loginLink).toBeVisible({ timeout: 15000 });
    console.log('✅ Home carregada e botão ENTRAR visível no cabeçalho (deslogado).');

    // 2. Tentar navegar para a página de detalhes do veículo publicado
    if (publishedVehicleId) {
      await page.goto(`/(tabs)/vehicle/${publishedVehicleId}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Deve carregar as especificações do veículo (ex: "PEÇAS DISPONÍVEIS" ou "RELATÓRIO TÉCNICO")
      const partsTitle = page.locator('text=/PEÇAS DISPONÍVEIS|RELATÓRIO TÉCNICO|VOLTAR/i').first();
      await expect(partsTitle).toBeVisible({ timeout: 15000 });
      console.log('✅ Acesso a detalhes de veículo deslogado verificado com sucesso.');
    }
  });

  test('Deve solicitar login com confirmação ao tentar favoritar ou negociar, e redirecionar de volta após login', async ({ page }) => {
    if (!publishedVehicleId) {
      test.skip();
      return;
    }

    await page.goto(`/(tabs)/vehicle/${publishedVehicleId}`);
    await page.waitForLoadState('domcontentloaded');

    // Configurar listener para o diálogo nativo do navegador (window.confirm)
    let dialogTriggered = false;
    let dialogMessage = '';
    
    page.on('dialog', async (dialog) => {
      dialogTriggered = true;
      dialogMessage = dialog.message();
      console.log(`ℹ️ [DIALOG] Capturado diálogo: "${dialogMessage}"`);
      await dialog.accept(); // Aceita/Clica em "OK/Fazer Login"
    });

    // Clicar em "INICIAR NEGOCIAÇÃO"
    const contactBtn = page.getByRole('button', { name: /INICIAR NEGOCIAÇÃO/i }).first();
    await expect(contactBtn).toBeVisible({ timeout: 10000 });
    await contactBtn.click();

    // Aguardar o diálogo ser exibido e aceito
    await page.waitForTimeout(1000);
    expect(dialogTriggered).toBe(true);
    expect(dialogMessage).toMatch(/logado|login/i);
    console.log('✅ Alerta de autenticação necessária exibido e aceito.');

    // Deve redirecionar para a tela de login contendo o parâmetro returnUrl
    await expect(page).toHaveURL(/.*login.*returnUrl.*/);
    console.log('✅ Redirecionado para a tela de login contendo returnUrl.');

    // Efetuar login com as credenciais do comprador do seed
    await page.locator('input[type="email"]').fill('comprador@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@123');
    await page.getByText('ENTRAR', { exact: true }).click();

    // Deve redirecionar de volta para a tela de detalhes do veículo original
    await expect(page).toHaveURL(new RegExp(`.*vehicle/${publishedVehicleId}`));
    console.log('✅ Login bem-sucedido e redirecionamento de volta à página do veículo verificado.');
  });

  test('Deve exibir tela de acesso restrito ao navegar para aba Favoritos deslogado', async ({ page }) => {
    // Ir para a aba favoritos
    await page.goto('/(tabs)/favoritos');
    await page.waitForLoadState('domcontentloaded');

    // Deve exibir o texto ACESSO RESTRITO
    const restrictedTitle = page.locator('text=/ACESSO RESTRITO/i').first();
    await expect(restrictedTitle).toBeVisible({ timeout: 10000 });

    const messageText = page.locator('text=/Faça login para ver seus veículos favoritos/i').first();
    await expect(messageText).toBeVisible();

    // O botão FAZER LOGIN deve estar presente
    const loginBtn = page.locator('text=/FAZER LOGIN/i').first();
    await expect(loginBtn).toBeVisible();
    console.log('✅ Tela de acesso restrito exibida com sucesso na aba Favoritos.');

    // Clicar em FAZER LOGIN e verificar se vai para a tela de login
    await loginBtn.click();
    await expect(page).toHaveURL(/.*login.*/);
    console.log('✅ Clique em FAZER LOGIN redirecionou corretamente para /login.');
  });
});
