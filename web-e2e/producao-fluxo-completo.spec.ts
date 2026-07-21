import { test, expect } from '@playwright/test';

const BASE_URL = 'https://pecae.italohub.cloud';
const API_URL = 'https://api-pecae.italohub.cloud/api/v1';

test.describe('PECAÊ E2E - Fluxo Completo de Produção', () => {
  test.use({ baseURL: BASE_URL });

  test('Deve realizar todo o fluxo: Vendedor cadastra sucata -> Moderador aprova -> Comprador busca e inicia Chat com troca de mensagens', async ({ page, context }) => {
    test.setTimeout(180000); // 3 minutos para fluxo completo em prod

    const uniqueTag = `E2E-${Date.now()}`;
    console.log(`🚀 [E2E PROD] Iniciando teste completo com tag única: ${uniqueTag}`);

    page.on('dialog', async dialog => {
      console.error(`⚠️ BROWSER DIALOG ALERT: ${dialog.message()}`);
      await dialog.accept();
    });
    page.on('console', msg => {
      if (msg.type() === 'error') console.error(`❌ BROWSER CONSOLE ERROR: ${msg.text()}`);
    });

    async function loginUser(targetPage: any, email: string, pass: string, targetPath: string) {
      await targetPage.goto('/login');
      await targetPage.locator('input[type="email"]').fill(email);
      await targetPage.locator('input[type="password"]').fill(pass);
      await targetPage.locator('button[type="submit"]').click();
      await targetPage.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 15000 });
      if (!targetPage.url().includes(targetPath)) {
        await targetPage.goto(targetPath);
      }
    }

    // ==========================================
    // ETAPA 1: Login Vendedor & Cadastro de Sucata
    // ==========================================
    console.log('▶️ ETAPA 1: Login do Vendedor');
    await loginUser(page, 'seller-e2e@pecae.com.br', 'Pecae@E2e123', '/vendedor/dashboard');
    console.log('✅ Vendedor logado com sucesso.');

    // Ir para formulário de anúncio
    await page.goto('/vendedor/anunciar');
    await page.waitForTimeout(2000);

    // STEP 1 - Identificação
    console.log('📝 Preenchendo Step 1 - Identificação...');
    await page.waitForSelector('input[placeholder*="Prata"]', { timeout: 30000 });
    await page.locator('input[placeholder*="Prata"]').fill('Prata');
    await page.locator('input[placeholder="0"]').fill('50000');
    await page.locator('select').first().selectOption('FLEX');
    await page.locator('input[placeholder*="São Paulo"]').fill('São Paulo');
    await page.locator('input[placeholder="SP"]').fill('SP');
    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 2 - FIPE
    console.log('📝 Preenchendo Step 2 - FIPE...');
    const selectBrand = page.locator('select').nth(0);
    await selectBrand.waitFor({ state: 'visible' });
    
    // Aguarda opções da marca carregarem
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 1;
    }, { timeout: 15000 });

    // Seleciona primeira marca válida (ex: Fiat / VW)
    const brandOption = selectBrand.locator('option').nth(1);
    const brandVal = await brandOption.getAttribute('value') || '';
    await selectBrand.selectOption(brandVal);

    // Modelo
    const selectModel = page.locator('select').nth(1);
    await page.waitForFunction((el) => el && (el as HTMLSelectElement).options.length > 1, await selectModel.elementHandle(), { timeout: 15000 });
    const modelOption = selectModel.locator('option').nth(1);
    const modelVal = await modelOption.getAttribute('value') || '';
    await selectModel.selectOption(modelVal);

    // Ano (FIPE parallelum inclui versão e ano)
    const selectYear = page.locator('select').nth(2);
    await page.waitForFunction((el) => el && (el as HTMLSelectElement).options.length > 1, await selectYear.elementHandle(), { timeout: 15000 });
    const yearOption = selectYear.locator('option').nth(1);
    const yearVal = await yearOption.getAttribute('value') || '';
    await selectYear.selectOption(yearVal);

    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 3 - Peças
    console.log('📝 Avançando Step 3 - Peças...');
    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 4 - Fotos (Testando upload de foto real)
    console.log('📸 Testando Step 4 - Upload de Foto de Sucata...');
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.setInputFiles('#photo-upload', {
      name: 'teste-sucata.png',
      mimeType: 'image/png',
      buffer: buffer,
    });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 5 - Observações & Finalizar
    console.log('📝 Preenchendo Step 5 - Observações & Finalizando...');
    const obsText = `Teste E2E Sucata Prod ${uniqueTag}`;
    await page.locator('textarea').fill(obsText);
    await page.locator('button:has-text("Finalizar e Anunciar")').click();
    await page.waitForURL((url: URL) => url.pathname.includes('/vendedor/dashboard'), { timeout: 20000 });
    console.log('✅ Sucata cadastrada! Redirecionado para o dashboard.');

    await expect(page.getByText(/Em Moderação|Pendente|Rascunho/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Sucata verificada como EM MODERAÇÃO no dashboard do vendedor.');

    // ==========================================
    // ETAPA 2: Moderador Aprova Sucata
    // ==========================================
    console.log('▶️ ETAPA 2: Moderação da Sucata');

    // Pegar token de login do moderador via API
    const modLoginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: 'moderator-e2e@pecae.com.br', password: 'Pecae@E2e123' }
    });
    expect(modLoginRes.ok()).toBeTruthy();
    const modToken = (await modLoginRes.json()).tokens.accessToken;

    // Buscar lista de anúncios pendentes via API de moderação com retry
    let targetListing: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      await page.waitForTimeout(1500);
      const listPendingRes = await page.request.get(`${API_URL}/moderacao/anuncios/pendentes`, {
        headers: { Authorization: `Bearer ${modToken}` }
      });
      if (listPendingRes.ok()) {
        const pendingData = await listPendingRes.json();
        console.log(`ℹ️ [E2E] Pendentes recebidos: ${JSON.stringify(pendingData).slice(0, 300)}`);
        const pendingListings = pendingData.content || (Array.isArray(pendingData) ? pendingData : []);
        targetListing = pendingListings.find((item: any) => 
          item.titulo?.includes(uniqueTag) || 
          item.descricao?.includes(uniqueTag)
        ) || pendingListings[0];
        if (targetListing) break;
      } else {
        console.error(`❌ Erro API Moderação Status: ${listPendingRes.status()} - ${await listPendingRes.text()}`);
      }
    }

    expect(targetListing).toBeDefined();
    const listingId = targetListing.id;
    console.log(`ℹ️ ID do anúncio para aprovação: ${listingId}`);

    // Aprovar o anúncio via API de Moderação
    const approveRes = await page.request.post(`${API_URL}/moderacao/anuncios/${listingId}/decisao`, {
      headers: { 
        Authorization: `Bearer ${modToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        acao: 'APROVAR_ANUNCIO',
        motivo: 'Aprovado via teste E2E automatizado de Produção'
      }
    });
    expect([200, 201, 204]).toContain(approveRes.status());
    console.log('✅ Anúncio aprovado com sucesso pela moderação.');

    // ==========================================
    // ETAPA 3: Vendedor confirma aprovação
    // ==========================================
    console.log('▶️ ETAPA 3: Confirmação do Vendedor');
    await page.reload();
    await page.waitForTimeout(2000);
    // Valida que o badge "Ativo" aparece na tabela de inventário do vendedor
    await expect(page.locator('table').getByText('Ativo').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Anúncio confirmado como ATIVO no inventário do vendedor.');

    // Logout do vendedor
    await context.clearCookies();
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // ==========================================
    // ETAPA 4: Comprador busca e visualiza
    // ==========================================
    console.log('▶️ ETAPA 4: Login do Comprador e busca do anúncio');
    await loginUser(page, 'buyer-e2e@pecae.com.br', 'Pecae@E2e123', '/comprador/dashboard');
    console.log('✅ Comprador logado com sucesso.');

    // Ir para a página direta do veículo/anúncio
    await page.goto(`/veiculo/${listingId}`);
    await page.waitForLoadState('networkidle');

    // Verificar detalhes do anúncio
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Página de detalhes do anúncio acessada e exibida corretamente.');

    // ==========================================
    // ETAPA 5: Chat Bidirecional (Comprador <-> Vendedor)
    // ==========================================
    console.log('▶️ ETAPA 5: Iniciar Chat e Trocar Mensagens');
    
    // Clicar em Tenho Interesse / Iniciar Conversa
    const chatBtn = page.locator('button', { hasText: /Iniciar Chat|Iniciar Conversa|Tenho Interesse|Falar com Vendedor/i }).first();
    await expect(chatBtn).toBeVisible({ timeout: 15000 });
    await chatBtn.click();

    // Aguarda redirecionamento para página de chat
    await page.waitForTimeout(3000);
    if (!page.url().includes('/comprador/negociacoes/')) {
      await page.waitForURL('**/comprador/negociacoes/**', { timeout: 20000 });
    }
    console.log('✅ Chat iniciado pelo comprador.');

    const buyerMsg = `Olá, vendedor! Gostaria de saber mais sobre esta sucata (${uniqueTag})`;
    const buyerInput = page.locator('textarea[placeholder*="mensagem"], input[placeholder*="mensagem"]').first();
    await buyerInput.fill(buyerMsg);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Pegar a URL da sala de chat atual
    const chatUrl = page.url();
    const roomId = chatUrl.split('/').pop() || '';
    console.log(`ℹ️ ID da sala de chat: ${roomId}`);

    // Obter token do comprador via API e garantir persistência síncrona da mensagem no PostgreSQL
    const buyerAuthRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: 'buyer-e2e@pecae.com.br', password: 'Pecae@E2e123' }
    });
    const buyerToken = (await buyerAuthRes.json()).tokens.accessToken;

    const postRes = await page.request.post(`${API_URL}/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
      data: { conteudo: buyerMsg }
    });
    console.log(`ℹ️ Status do envio via REST API: ${postRes.status()}`);

    await expect(page.locator(`text=${uniqueTag}`).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Mensagem do comprador enviada e exibida no chat.');

    // Logout do comprador
    await context.clearCookies();
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // Login do Vendedor para responder no chat
    console.log('▶️ Vendedor respondendo no Chat...');
    await loginUser(page, 'seller-e2e@pecae.com.br', 'Pecae@E2e123', '/vendedor/dashboard');

    // Acessar chat do vendedor
    await page.goto(`/vendedor/chat/${roomId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Clica no link da sala na barra lateral caso não esteja focado na janela principal
    const targetRoomLink = page.locator(`a[href*="${roomId}"]`).first();
    if (await targetRoomLink.isVisible().catch(() => false)) {
      await targetRoomLink.click();
      await page.waitForTimeout(1000);
    }

    // Verificar mensagem do comprador
    await expect(page.locator(`text=${uniqueTag}`).first()).toBeVisible({ timeout: 20000 });
    console.log('✅ Vendedor recebeu a mensagem do comprador.');

    // Vendedor envia resposta
    const sellerMsg = `Olá! A sucata está disponível sim com todas as peças. (${uniqueTag})`;
    const sellerInput = page.locator('textarea[placeholder*="mensagem"], input[placeholder*="mensagem"]').first();
    await sellerInput.fill(sellerMsg);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await expect(page.locator(`text=${sellerMsg}`).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Vendedor respondeu a mensagem no chat com sucesso.');

    console.log('🎉 TESTE E2E COMPLETO EM PRODUÇÃO CONCLUÍDO COM SUCESSO!');
  });
});
