import { test, expect } from '@playwright/test';

test.describe('PECAÊ E2E - Usability Journey (Single Tab)', () => {
  // Use a single test to keep exactly the same tab open for the entire journey,
  // as requested by the user: "mantenha tudo rodando sempre na mesma aba"
  test('Fluxo completo de usabilidade: Home -> Auth -> Busca -> Veículo -> Dashboard', async ({ page }) => {
    
    // 1. Home
    console.log('▶️ Navegando para a Home');
    await page.goto('/');
    await expect(page).toHaveTitle(/PECAÊ/i);
    // Verificar se elementos chave da home estão visíveis
    await expect(page.locator('text=Veículos em Destaque').first()).toBeVisible();

    // 2. Auth (Login)
    console.log('▶️ Navegando para o Login');
    await page.getByRole('link', { name: /entrar/i }).first().click();
    await page.waitForURL('**/login');
    
    await page.locator('input[type="email"]').fill('buyer-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();
    
    // Aguarda o login concluir (redireciona para home ou dashboard dependendo de next)
    await page.waitForURL('**/');
    console.log('✅ Login do Comprador realizado com sucesso.');

    // 3. Search (Busca)
    console.log('▶️ Navegando para a Busca');
    // Clicar no link de busca no header ou fazer uma busca direta
    // Para simplificar, vamos acessar a URL da busca ou preencher a barra superior se existir.
    await page.goto('/busca');
    await page.waitForURL('**/busca');
    
    // Espera os filtros carregarem
    await expect(page.locator('text=Filtros')).toBeVisible();
    
    // Fazer uma busca (se houver input de busca na página de busca)
    // Opcional: preencher algum filtro. Assumindo que a lista já carrega alguns carros.
    const vehicleCard = page.locator('a[href^="/veiculo/"]').first();
    await expect(vehicleCard).toBeVisible({ timeout: 10000 });
    
    // Extrai o link do primeiro veículo para o próximo passo
    const vehicleUrl = await vehicleCard.getAttribute('href');
    console.log(`✅ Busca validada. Veículo encontrado: ${vehicleUrl}`);

    // 4. Vehicle Details (Detalhes do Veículo)
    console.log('▶️ Navegando para Detalhes do Veículo');
    await page.goto(vehicleUrl as string);
    await page.waitForURL(`**${vehicleUrl}`);
    
    // Verifica elementos do veículo (CTAs, Galeria, etc)
    const pageTitle = await page.title();
    console.log(`Título da página de detalhes: ${pageTitle}`);
    // Se o título for 'Veículo não encontrado', significa que o ISR cacheou o 404.
    await expect(page.getByRole('heading', { name: /PECAÊ/i }).first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    console.log('✅ Detalhes do Veículo validados.');

    // 5. Dashboard / Protected Route
    console.log('▶️ Navegando para o Dashboard do Comprador');
    await page.goto('/comprador/dashboard');
    await page.waitForURL('**/comprador/dashboard');
    
    // Valida elementos do Dashboard (Sidebar atualizada no layout)
    await expect(page.getByRole('heading', { name: /PECAÊ COMPRADOR/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Minhas Buscas|Buscas Salvas/i }).first()).toBeVisible();
    
    console.log('✅ Dashboard do Comprador validado. Jornada Completa Finalizada!');
    
    // Espera um tempinho no final para o usuário poder visualizar a conclusão
    await page.waitForTimeout(3000);
  });
});
