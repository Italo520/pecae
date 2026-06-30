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

test.describe('PECAÊ E2E - Acesso Deslogado (Guest Access) - Web Next.js', () => {
  let publishedVehicleId = '';

  test.beforeAll(async () => {
    // Obter um ID de veículo publicado do banco de dados para testar navegação direta
    publishedVehicleId = runSqlQuery("SELECT v.id FROM vehicles v JOIN listings l ON l.vehicle_id = v.id WHERE l.status = 'PUBLISHED' LIMIT 1;");
    console.log(`ℹ️ [GUEST ACCESS] Veículo Publicado ID para teste: ${publishedVehicleId}`);
    
    if (!publishedVehicleId) {
      console.warn('⚠️ [GUEST ACCESS] Nenhum veículo publicado encontrado no banco de dados. Teste direto de veículo pode falhar.');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Garantir que começamos o teste deslogados
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Limpar cookies específicos do app para deslogar totalmente
    const context = page.context();
    await context.clearCookies();
    await page.reload();
  });

  test('Deve permitir visualizar a home e acessar detalhes de veículo deslogado', async ({ page }) => {
    // 1. Verificar se a home carrega normalmente e exibe o botão Entrar no header
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loginLink = page.locator('text=/Entrar|Login/i').first();
    await expect(loginLink).toBeVisible({ timeout: 15000 });
    console.log('✅ Home carregada e botão Entrar/Login visível no cabeçalho.');

    // 2. Tentar navegar para a página de detalhes do veículo publicado
    if (publishedVehicleId) {
      await page.goto(`/veiculo/${publishedVehicleId}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Deve carregar detalhes do veículo como a placa ou seções de peças
      const partsTitle = page.locator('text=/Placa|Especificações|Peças Disponíveis|Voltar/i').first();
      await expect(partsTitle).toBeVisible({ timeout: 15000 });
      console.log('✅ Acesso a detalhes de veículo deslogado verificado com sucesso.');
    }
  });

  test('Deve redirecionar para a tela de login ao tentar acessar rotas protegidas (comprador/favoritos) deslogado', async ({ page }) => {
    // 1. Ir direto para a rota protegida
    await page.goto('/comprador/favoritos');
    
    // 2. O layout do comprador deve redirecionar imediatamente para /login
    await page.waitForURL('**/login', { timeout: 15000 });
    
    // 3. Garantir que o formulário de login está visível
    const loginForm = page.locator('input[type="email"]').first();
    await expect(loginForm).toBeVisible();
    console.log('✅ Tentativa de acesso a rota protegida deslogado redirecionou corretamente para a tela de login.');
  });
});
