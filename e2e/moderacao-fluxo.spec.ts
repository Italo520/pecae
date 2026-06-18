import { test, expect } from '@playwright/test';

// Forçar execução em modo visual (headed) para acompanhamento da automação.
test.use({ headless: false });

test.describe('Fluxo E2E de Moderação e Publicação - PECAÊ', () => {

  test('Deve cadastrar veículo como vendedor, aprovar como moderador e validar ativo para vendedor e comprador', async ({ page }) => {
    test.setTimeout(180000);
    // -------------------------------------------------------------------------
    // PREPARAÇÃO DE VARIÁVEIS COM TIMESTAMPS ÚNICOS
    // -------------------------------------------------------------------------
    const timestamp = Date.now();
    const brandName = `Modbrand${timestamp}`;
    const modelName = `Modmodel${timestamp}`;
    const versionName = `1.0 Mod`;
    const yearText = `2020/2021`;
    const listingTitle = `Sucata Mod Teste ${timestamp}`;
    const description = `Veículo cadastrado para o fluxo completo de moderação e aprovação visual.`;
    const observations = `Moderação E2E - Observação de teste.`;

    console.log(`🚀 Iniciando teste integrado de moderação para: ${listingTitle}`);

    // Captura logs do console do navegador para depuração.
    page.on('console', msg => {
      console.log(`[Navegador] [${msg.type()}] ${msg.text()}`);
    });

    // Captura falhas de requisições de rede
    page.on('requestfailed', request => {
      console.log(`❌ Falha na requisição: ${request.url()} | Erro: ${request.failure()?.errorText}`);
    });

    // Captura respostas com status de erro (>= 400)
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Resposta com erro: ${response.url()} | Status: ${response.status()}`);
      }
    });

    // =========================================================================
    // ETAPA 1: CADASTRO DO VEÍCULO (VENDEDOR)
    // =========================================================================
    // 1.1 Login na plataforma como Vendedor
    await page.goto('https://pecae.italohub.cloud/(auth)/login');
    await page.locator('input[type="email"]').fill('vendedor@teste.com');
    await page.locator('input[type="password"]').fill('senha123');
    await page.getByText('ENTRAR', { exact: true }).click();

    // Aguarda redirecionamento para o painel do vendedor
    await expect(page).toHaveURL(/.*(seller-tabs|inventory|dashboard|onboarding|\/$)/, { timeout: 15000 });
    console.log('✅ Vendedor logado com sucesso.');

    // 1.2 Acesso ao Wizard de cadastro de sucata
    await page.goto('https://pecae.italohub.cloud/(seller)/cadastrar-sucata');
    await page.waitForLoadState('domcontentloaded');

    // Selecionar o tipo de veículo "Carros" se o botão estiver visível no formulário
    const typeBtn = page.getByText('Carros');
    if (await typeBtn.isVisible()) {
      await typeBtn.click();
    }

    // 1.3 Passo 1: Informações de catálogo
    await page.getByPlaceholder('Buscar ou digitar marca...').fill(brandName);
    await page.getByText(`+ Cadastrar "${brandName}" como nova Marca`).click();

    await page.getByPlaceholder('Buscar ou digitar modelo...').fill(modelName);
    await page.getByText(`+ Cadastrar "${modelName}" como novo Modelo`).click();

    await page.getByPlaceholder('Buscar ou digitar versão...').fill(versionName);
    await page.getByText(`+ Cadastrar "${versionName}" como nova Versão`).click();

    await page.getByPlaceholder('Buscar ano (ex: 2015 ou 2012/2013)...').fill(yearText);
    await page.getByText(`+ Cadastrar Ano: ${yearText}`).click();

    // Confirma veículo e avança com tolerância a desmontagem de componentes
    await page.getByText('Confirmar Veículo').click({ timeout: 5000 }).catch(() => console.log('⚠️ Confirmar Veículo desmontado ou avançado.'));
    console.log('✅ Passo 1: Informações de catálogo preenchidas.');

    // 1.4 Passo 2: Detalhes técnicos (placa opcional)
    await page.getByPlaceholder('Ex: Prata').fill('Azul');
    await page.getByPlaceholder('Ex: São Paulo').fill('Santos');
    await page.getByPlaceholder('SP').fill('SP');
    await page.getByPlaceholder('Detalhes sobre a batida, estado do motor, etc.').fill(observations);
    await page.getByText(/próximo/i).click({ timeout: 5000 }).catch(() => console.log('⚠️ Próximo (Passo 2) desmontado ou avançado.'));
    console.log('✅ Passo 2: Detalhes técnicos preenchidos.');

    // 1.5 Passo 3: Injeção de Fotos (Mínimo de 4 fotos exigido pela validação do wizard)
    await page.evaluate(() => {
      const store = (window as any).useVehicleWizardStore.getState();
      store.updateData({
        photos: [
          { uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo1-teste-e2e-moderacao.jpg' },
          { uri: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo2-teste-e2e-moderacao.jpg' },
          { uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo3-teste-e2e-moderacao.jpg' },
          { uri: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80', type: 'image/jpeg', name: 'photo4-teste-e2e-moderacao.jpg' }
        ],
        coverPhotoUri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'
      });
    });
    await page.getByText(/próximo/i).click({ timeout: 5000 }).catch(() => console.log('⚠️ Próximo (Passo 3) desmontado ou avançado.'));
    console.log('✅ Passo 3: Fotos injetadas.');

    // 1.6 Passo 4: Inventário de Peças via Zustand
    await page.evaluate(({ titleVal, descVal, obsVal }) => {
      const store = (window as any).useVehicleWizardStore.getState();
      store.updateData({
        title: titleVal,
        description: descVal,
        observations: obsVal,
        availableParts: [
          'db5c4741-a8f8-411b-8055-b509fe51e280', // Cabeçote
          '52646253-8b90-429c-b080-7dfb0b674d49'  // Bloco
        ]
      });
      store.nextStep();
    }, { titleVal: listingTitle, descVal: description, obsVal: observations });
    console.log('✅ Passo 4: Inventário preenchido e avançado via Zustand.');

    // 1.7 Passo 5: Revisão e Submissão com cliques resilientes
    const finalizeBtn = page.getByText('FINALIZAR CADASTRO');
    await finalizeBtn.scrollIntoViewIfNeeded().catch(() => {});
    await finalizeBtn.click({ timeout: 10000 }).catch(async () => {
      console.log('⚠️ Clique padrão falhou no FINALIZAR CADASTRO, tentando via dispatchEvent.');
      await finalizeBtn.dispatchEvent('click');
    });
    console.log('✅ Passo 5: Botão de finalizar cadastro clicado.');

    // Dispensar Toast de Confirmação
    const entendidoBtn = page.getByText('ENTENDIDO');
    await expect(entendidoBtn).toBeVisible({ timeout: 20000 });
    await entendidoBtn.click({ timeout: 5000 }).catch(async () => {
      console.log('⚠️ Clique padrão falhou no ENTENDIDO, tentando via dispatchEvent.');
      await entendidoBtn.dispatchEvent('click');
    });
    console.log('✅ Toast de confirmação dispensado.');

    // 1.8 Validar que o veículo recém-cadastrado exibe o status "AGUARDANDO APROVAÇÃO"
    await expect(page).toHaveURL(/.*inventory/, { timeout: 10000 });
    const cardPending = page.locator('div').filter({ hasText: modelName }).filter({ hasText: 'AGUARDANDO APROVAÇÃO' }).last();
    await expect(cardPending).toBeVisible({ timeout: 15000 });
    console.log('✅ Validação Vendedor: Veículo criado exibido como "AGUARDANDO APROVAÇÃO".');

    // Limpar tokens de sessão no storage para efetuar logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Vendedor deslogado.');

    // =========================================================================
    // ETAPA 2: APROVAÇÃO DO ANÚNCIO (MODERADOR)
    // =========================================================================
    // 2.1 Login como Moderador
    await page.goto('https://pecae.italohub.cloud/(auth)/login');
    await page.locator('input[type="email"]').fill('moderator-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.getByText('ENTRAR', { exact: true }).click();

    // Aguarda carregar a fila de moderação do moderador
    await expect(page).toHaveURL(/.*(\(moderator\)|\/$)/, { timeout: 15000 });
    console.log('✅ Moderador logado com sucesso.');

    // 2.2 Localiza o card com o título dinâmico na fila de moderação pendente
    const modCard = page.getByText(listingTitle).first();
    await expect(modCard).toBeVisible({ timeout: 20000 });
    await modCard.click();
    console.log('✅ Card do anúncio pendente clicado na fila do moderador.');

    // 2.3 No modal de detalhes abertos, clica no botão "APROVAR ANÚNCIO"
    const approveBtn = page.getByText('APROVAR ANÚNCIO').first();
    await approveBtn.scrollIntoViewIfNeeded().catch(() => {});
    await expect(approveBtn).toBeVisible({ timeout: 10000 });
    await approveBtn.click({ timeout: 5000 }).catch(async () => {
      console.log('⚠️ Clique padrão falhou no APROVAR ANÚNCIO, tentando via dispatchEvent.');
      await approveBtn.dispatchEvent('click');
    });

    // 2.4 Valida que o Toast de moderação com sucesso é exibido
    const toastApprove = page.getByText(/aprovado|sucesso/i).first();
    await expect(toastApprove).toBeVisible({ timeout: 10000 });
    console.log('✅ Anúncio aprovado com sucesso pelo moderador.');

    // Efetua logout limpando os dados da sessão
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Moderador deslogado.');

    // =========================================================================
    // ETAPA 3: VALIDAÇÃO DO STATUS ATIVO (VENDEDOR)
    // =========================================================================
    // 3.1 Login como Vendedor novamente
    await page.goto('https://pecae.italohub.cloud/(auth)/login');
    await page.locator('input[type="email"]').fill('vendedor@teste.com');
    await page.locator('input[type="password"]').fill('senha123');
    await page.getByText('ENTRAR', { exact: true }).click();

    await expect(page).toHaveURL(/.*(seller-tabs|inventory|dashboard|onboarding|\/$)/, { timeout: 15000 });
    
    // Navega explicitamente para o inventário do vendedor
    await page.goto('https://pecae.italohub.cloud/(seller)/(seller-tabs)/inventory');
    
    // 3.2 Valida que o status do card correspondente mudou para "ATIVO"
    const cardActive = page.locator('div').filter({ hasText: modelName }).filter({ hasText: 'ATIVO' }).last();
    await expect(cardActive).toBeVisible({ timeout: 15000 });
    console.log('✅ Validação Vendedor: Status do veículo atualizado para "ATIVO".');

    // Efetua logout
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Vendedor deslogado final.');

    // =========================================================================
    // ETAPA 4: VALIDAÇÃO NA PÁGINA INICIAL (COMPRADOR)
    // =========================================================================
    // 4.1 Acessa a home do comprador pública com retentativas para evitar falhas de rede/DNS intermitentes
    console.log('🔄 Acessando a Home Page do comprador...');
    await page.goto('https://pecae.italohub.cloud/(tabs)/');
    
    // Tenta validar a visibilidade do card. Se não aparecer, recarrega a página (até 3 tentativas)
    const homeCard = page.locator('div').filter({ hasText: modelName }).last();
    let cardVisible = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔍 Procurando anúncio na Home (Tentativa ${attempt}/3)...`);
      try {
        await homeCard.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await expect(homeCard).toBeVisible({ timeout: 10000 });
        cardVisible = true;
        break;
      } catch (err) {
        console.log(`⚠️ Anúncio não apareceu na Home. Recarregando página...`);
        await page.reload();
        await page.waitForTimeout(3000);
      }
    }

    if (!cardVisible) {
      // Faz um último expect caso não tenha aparecido para gerar o log correto
      await expect(homeCard).toBeVisible({ timeout: 10000 });
    }
    console.log('✅ Validação Comprador: Veículo aprovado está visível na home do aplicativo.');
  });
});
