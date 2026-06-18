import { test, expect } from '@playwright/test';

// Configuração estrita de aba única e modo visual no nível superior
test.use({ headless: false });

test.describe('Fluxo E2E do Vendedor - PECAÊ', () => {

  test('Deve logar, cadastrar veículo/sucata e validar no inventário com status AGUARDANDO APROVAÇÃO', async ({ page }) => {
    // Definir nomes de teste únicos com timestamp
    const timestamp = Date.now();
    const brandName = `GsdBrand${timestamp}`;
    const modelName = `GsdModel${timestamp}`;
    const versionName = `1.0 Gsd`;
    const yearText = `2020/2021`;
    const listingTitle = `Sucata Gsd Teste ${timestamp}`;
    const description = `Veículo de teste E2E cadastrado de forma automática e resiliente.`;
    const observations = `E2E GSD - Observação de teste.`;

    console.log(`🚀 Iniciando teste do Vendedor para o veículo: ${brandName} ${modelName}`);

    // Capturar logs de console para debug
    page.on('console', msg => {
      console.log(`[Navegador] [${msg.type()}] ${msg.text()}`);
    });

    // 1. Acessar a página de login do Staging
    await page.goto('https://pecae.italohub.cloud/(auth)/login');
    
    // 2. Realizar login com o usuário criado
    await page.locator('input[type="email"]').fill('vendedor@teste.com');
    await page.locator('input[type="password"]').fill('senha123');
    await page.getByText('ENTRAR', { exact: true }).click();

    // Aguardar redirecionamento para o dashboard/tabs
    await expect(page).toHaveURL(/.*(seller-tabs|inventory|dashboard|onboarding|\/$)/, { timeout: 15000 });
    await expect(page.locator('text=/Olá, Vendedor!|Inventário|Início/').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Login realizado com sucesso.');

    // 3. Acessar tela de cadastro
    await page.goto('https://pecae.italohub.cloud/(seller)/cadastrar-sucata');
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Tela de cadastro de sucata acessada.');

    // Selecionar o tipo de veículo "Carros" se o botão estiver visível
    const typeBtn = page.getByText('Carros');
    if (await typeBtn.isVisible()) {
      await typeBtn.click();
      console.log('✅ Tipo de veículo "Carros" selecionado.');
    }

    // 4. Passo 1: Selecionar/cadastrar marca, modelo, versão e ano
    await page.getByPlaceholder('Buscar ou digitar marca...').fill(brandName);
    await page.getByText(`+ Cadastrar "${brandName}" como nova Marca`).click();

    await page.getByPlaceholder('Buscar ou digitar modelo...').fill(modelName);
    await page.getByText(`+ Cadastrar "${modelName}" como novo Modelo`).click();

    await page.getByPlaceholder('Buscar ou digitar versão...').fill(versionName);
    await page.getByText(`+ Cadastrar "${versionName}" como nova Versão`).click();

    await page.getByPlaceholder('Buscar ano (ex: 2015 ou 2012/2013)...').fill(yearText);
    await page.getByText(`+ Cadastrar Ano: ${yearText}`).click();

    // Confirmar seleção
    await page.getByText('Confirmar Veículo').click();
    console.log('✅ Passo 1: Informações de catálogo preenchidas.');

    // 5. Passo 2: Detalhes Técnicos
    await page.getByPlaceholder('Ex: Prata').fill('Vermelho');
    await page.getByPlaceholder('Ex: São Paulo').fill('Campinas');
    await page.getByPlaceholder('SP').fill('SP');
    await page.getByPlaceholder('Detalhes sobre a batida, estado do motor, etc.').fill(observations);
    await page.getByText(/próximo/i).click();
    console.log('✅ Passo 2: Detalhes técnicos preenchidos.');

    // 6. Passo 3: Injeção de Fotos no Zustand
    await page.evaluate(() => {
      const store = (window as any).useVehicleWizardStore.getState();
      store.updateData({
        photos: [
          { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo1.jpg' },
          { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo2.jpg' },
          { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo3.jpg' },
          { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo4.jpg' },
        ],
        coverPhotoUri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'
      });
    });
    await page.getByText(/próximo/i).click();
    console.log('✅ Passo 3: Fotos injetadas e validadas.');

    // 7. Passo 4: Inventário de Peças
    await page.getByText('MARCAR TODOS').click();
    await page.getByPlaceholder('Ex: Sucata Uno Vivace 2015 Inteira').fill(listingTitle);
    await page.getByPlaceholder('Descreva o estado geral para o comprador...').fill(description);
    
    // Tentar clicar no botão de avançar (Próximo ou Revisar Cadastro)
    const nextBtn = page.locator('button, [role="button"], text=Próximo, text="Revisar Cadastro"').first();
    await nextBtn.click();
    console.log('✅ Passo 4: Inventário preenchido.');

    // 8. Passo 5: Revisão e Finalização
    await page.getByText('FINALIZAR CADASTRO').click();
    console.log('✅ Passo 5: Botão de finalizar cadastro clicado.');

    // Aguardar e clicar no botão "ENTENDIDO" do Toast para prosseguir
    const entendidoBtn = page.getByText('ENTENDIDO');
    await expect(entendidoBtn).toBeVisible({ timeout: 15000 });
    await entendidoBtn.click();
    console.log('✅ Toast de confirmação dispensado.');

    // Esperar redirecionamento automático para a lista de inventário
    await expect(page).toHaveURL(/.*inventory/, { timeout: 10000 });
    console.log('✅ Redirecionado para inventário do vendedor.');

    // 9. Validar presença do card no Inventário com status "AGUARDANDO APROVAÇÃO"
    const cardTitle = page.locator(`text=${brandName} ${modelName}`).first();
    await expect(cardTitle).toBeVisible({ timeout: 10000 });
    
    // Validar a tag de status "AGUARDANDO APROVAÇÃO" no card
    const card = page.locator('div').filter({ hasText: `${brandName} ${modelName}` }).first();
    const statusBadge = card.locator('text="AGUARDANDO APROVAÇÃO"').first();
    await expect(statusBadge).toBeVisible();
    console.log('✅ Teste E2E concluído com sucesso no frontend! Tag "AGUARDANDO APROVAÇÃO" visível.');
  });
});
