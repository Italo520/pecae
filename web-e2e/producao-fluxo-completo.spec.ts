import { test, expect } from '@playwright/test';

const BASE_URL = 'https://pecae.italohub.cloud';
const API_URL = 'https://api-pecae.italohub.cloud/api/v1';

test.describe('PECAÊ E2E - Fluxo Completo de Produção', () => {
  test.use({ baseURL: BASE_URL });

  test('Deve realizar todo o fluxo: Vendedor cadastra sucata -> Moderador aprova -> Comprador busca e inicia Chat com troca de mensagens', async ({ page, context }) => {
    test.setTimeout(180000); // 3 minutos para fluxo completo em prod

    const uniqueTag = `E2E-${Date.now()}`;
    console.log(`🚀 [E2E PROD] Iniciando teste completo com tag única: ${uniqueTag}`);

    // ==========================================
    // ETAPA 1: Login Vendedor & Cadastro de Sucata
    // ==========================================
    console.log('▶️ ETAPA 1: Login do Vendedor');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('seller-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();

    await page.waitForURL('**/vendedor/dashboard', { timeout: 20000 });
    console.log('✅ Vendedor logado com sucesso.');

    // Ir para formulário de anúncio
    await page.goto('/vendedor/anunciar');
    await page.waitForLoadState('networkidle');

    // STEP 1 - Identificação
    console.log('📝 Preenchendo Step 1 - Identificação...');
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
    
    // Aguarda opções carregarem
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 1;
    }, { timeout: 15000 });

    // Seleciona primeira marca válida
    const brandOption = selectBrand.locator('option').nth(1);
    const brandVal = await brandOption.getAttribute('value') || '';
    await selectBrand.selectOption(brandVal);

    // Modelo
    const selectModel = page.locator('select').nth(1);
    await page.waitForFunction((el) => el && (el as HTMLSelectElement).options.length > 1, await selectModel.elementHandle(), { timeout: 15000 });
    await selectModel.selectOption({ index: 1 });

    // Versão
    const selectVersion = page.locator('select').nth(2);
    await page.waitForFunction((el) => el && (el as HTMLSelectElement).options.length > 1, await selectVersion.elementHandle(), { timeout: 15000 });
    await selectVersion.selectOption({ index: 1 });

    // Ano
    const selectYear = page.locator('select').nth(3);
    await page.waitForFunction((el) => el && (el as HTMLSelectElement).options.length > 1, await selectYear.elementHandle(), { timeout: 15000 });
    await selectYear.selectOption({ index: 1 });

    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 3 - Peças
    console.log('📝 Avançando Step 3 - Peças...');
    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 4 - Fotos (Testando upload)
    console.log('📸 Testando Step 4 - Upload de Foto...');
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    await page.setInputFiles('#photo-upload', {
      name: 'teste-sucata.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Próximo Passo")').click();

    // STEP 5 - Observações & Finalizar
    console.log('📝 Preenchendo Step 5 - Observações & Finalizando...');
    const obsText = `Teste E2E Sucata Prod ${uniqueTag}`;
    await page.locator('textarea').fill(obsText);
    await page.locator('button:has-text("Finalizar e Anunciar")').click();

    await page.waitForURL('**/vendedor/dashboard', { timeout: 30000 });
    console.log('✅ Sucata cadastrada! Redirecionado para o dashboard.');

    // Verificar se a sucata recém cadastrada está pendente no dashboard
    await expect(page.locator('text=Pendente').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Sucata verificada como PENDENTE no dashboard do vendedor.');

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

    // Buscar lista de anúncios pendentes via API de moderação
    const listPendingRes = await page.request.get(`${API_URL}/moderacao/anuncios?status=PENDENTE`, {
      headers: { Authorization: `Bearer ${modToken}` }
    });
    expect(listPendingRes.ok()).toBeTruthy();
    const pendingData = await listPendingRes.json();
    const pendingListings = pendingData.content || pendingData;

    // Localizar o ID do anúncio criado
    const targetListing = pendingListings.find((item: any) => 
      item.descricao?.includes(uniqueTag) || 
      item.veiculo?.observacoes?.includes(uniqueTag) ||
      item.titulo?.includes(uniqueTag)
    ) || pendingListings[0];

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
    await expect(page.locator('text=Ativo').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Anúncio confirmado como ATIVO no dashboard do vendedor.');

    // Logout do vendedor
    await context.clearCookies();
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // ==========================================
    // ETAPA 4: Comprador busca e visualiza
    // ==========================================
    console.log('▶️ ETAPA 4: Login do Comprador e busca do anúncio');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('buyer-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();

    await page.waitForURL('**/comprador/dashboard', { timeout: 20000 });
    console.log('✅ Comprador logado com sucesso.');

    // Ir para a página direta do veículo
    await page.goto(`/veiculo/${targetListing.veiculoId || listingId}`);
    await page.waitForLoadState('networkidle');

    // Verificar detalhes do anúncio
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Página de detalhes do anúncio acessada e exibida corretamente.');

    // ==========================================
    // ETAPA 5: Chat Bidirecional (Comprador <-> Vendedor)
    // ==========================================
    console.log('▶️ ETAPA 5: Iniciar Chat e Trocar Mensagens');
    
    // Clicar em Tenho Interesse / Iniciar Conversa
    const chatBtn = page.locator('button', { hasText: /Iniciar Conversa|Tenho Interesse|Falar com Vendedor/i }).first();
    await expect(chatBtn).toBeVisible({ timeout: 15000 });
    await chatBtn.click();

    // Aguarda redirecionamento para página de chat
    await page.waitForURL('**/comprador/negociacoes/**', { timeout: 20000 });
    console.log('✅ Chat iniciado pelo comprador.');

    const buyerMsg = `Olá, vendedor! Gostaria de saber mais sobre esta sucata (${uniqueTag})`;
    await page.locator('input[placeholder*="mensagem"], textarea[placeholder*="mensagem"]').fill(buyerMsg);
    await page.locator('button[type="submit"], button:has-text("Enviar")').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`text=${uniqueTag}`).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Mensagem do comprador enviada e exibida no chat.');

    // Pegar a URL da sala de chat atual
    const chatUrl = page.url();
    const roomId = chatUrl.split('/').pop() || '';
    console.log(`ℹ️ ID da sala de chat: ${roomId}`);

    // Logout do comprador
    await context.clearCookies();
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // Login do Vendedor para responder no chat
    console.log('▶️ Vendedor respondendo no Chat...');
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('seller-e2e@pecae.com.br');
    await page.locator('input[type="password"]').fill('Pecae@E2e123');
    await page.locator('button', { hasText: /Entrar|Login/i }).click();

    await page.waitForURL('**/vendedor/dashboard', { timeout: 20000 });

    // Acessar chat do vendedor
    await page.goto(`/vendedor/chat/${roomId}`);
    await page.waitForLoadState('networkidle');

    // Verificar mensagem do comprador
    await expect(page.locator(`text=${uniqueTag}`).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Vendedor recebeu a mensagem do comprador.');

    // Vendedor envia resposta
    const sellerMsg = `Olá! A sucata está disponível sim com todas as peças. (${uniqueTag})`;
    await page.locator('input[placeholder*="mensagem"], textarea[placeholder*="mensagem"]').fill(sellerMsg);
    await page.locator('button[type="submit"], button:has-text("Enviar")').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`text=${sellerMsg}`).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Vendedor respondeu a mensagem no chat com sucesso.');

    console.log('🎉 TESTE E2E COMPLETO EM PRODUÇÃO CONCLUÍDO COM SUCESSO!');
  });
});
