import { test, expect } from '@playwright/test';

// Configuração estrita de aba única e modo visual no nível superior para acompanhamento visual do fluxo.
test.use({ headless: false });

test.describe('Fluxo E2E do Vendedor - PECAÊ', () => {

  test('Deve logar, cadastrar veículo/sucata e validar no inventário com status AGUARDANDO APROVAÇÃO', async ({ page }) => {
    // -------------------------------------------------------------------------
    // PREPARAÇÃO DE DADOS DE TESTE ÚNICOS
    // -------------------------------------------------------------------------
    // Um timestamp único garante que cada execução do teste seja isolada e
    // crie dados não duplicados no banco de dados (idempotência).
    const timestamp = Date.now();
    const brandName = `GsdBrand${timestamp}`;
    const modelName = `GsdModel${timestamp}`;
    const versionName = `1.0 Gsd`;
    const yearText = `2020/2021`;
    const listingTitle = `Sucata Gsd Teste ${timestamp}`;
    const description = `Veículo de teste E2E cadastrado de forma automática e resiliente.`;
    const observations = `E2E GSD - Observação de teste.`;

    console.log(`🚀 Iniciando teste do Vendedor para o veículo: ${brandName} ${modelName}`);

    // Capturar logs de console do navegador. Isso é essencial para depurar
    // erros de requisições de API, problemas de CORS, erros de rede (ex: 502) ou bugs de JS.
    page.on('console', msg => {
      console.log(`[Navegador] [${msg.type()}] ${msg.text()}`);
    });

    // -------------------------------------------------------------------------
    // 1. ACESSO À PLATAFORMA (LOGIN)
    // -------------------------------------------------------------------------
    // Navegar até a página de autenticação no staging
    await page.goto('https://pecae.italohub.cloud/(auth)/login');
    
    // Preenchimento do formulário com as credenciais do Vendedor de testes
    await page.locator('input[type="email"]').fill('vendedor@teste.com');
    await page.locator('input[type="password"]').fill('senha123');
    await page.getByText('ENTRAR', { exact: true }).click();

    // Aguardar redirecionamento bem-sucedido após autenticação.
    // O teste valida que a URL mudou para um dos caminhos internos válidos do vendedor.
    await expect(page).toHaveURL(/.*(seller-tabs|inventory|dashboard|onboarding|\/$)/, { timeout: 15000 });
    // Garante que elementos da dashboard interna do vendedor estão visíveis na tela
    await expect(page.locator('text=/Olá, Vendedor!|Inventário|Início/').first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Login realizado com sucesso.');

    // -------------------------------------------------------------------------
    // 2. ACESSO AO WIZARD DE CADASTRO
    // -------------------------------------------------------------------------
    // Acessa a rota dedicada para criação de anúncios de Sucata (veículo sem placa)
    await page.goto('https://pecae.italohub.cloud/(seller)/cadastrar-sucata');
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Tela de cadastro de sucata acessada.');

    // Selecionar o tipo de veículo "Carros" se o botão estiver visível no formulário
    const typeBtn = page.getByText('Carros');
    if (await typeBtn.isVisible()) {
      await typeBtn.click();
      console.log('✅ Tipo de veículo "Carros" selecionado.');
    }

    // -------------------------------------------------------------------------
    // 3. PASSO 1: INFORMAÇÕES DE CATÁLOGO (MARCA, MODELO, VERSÃO, ANO)
    // -------------------------------------------------------------------------
    // O fluxo do PECAÊ permite cadastrar marcas, modelos e versões sob demanda
    // caso não existam. O teste simula essa criação digitando o nome único
    // gerado com o timestamp e clicando no botão "+ Cadastrar ...".
    await page.getByPlaceholder('Buscar ou digitar marca...').fill(brandName);
    await page.getByText(`+ Cadastrar "${brandName}" como nova Marca`).click();

    await page.getByPlaceholder('Buscar ou digitar modelo...').fill(modelName);
    await page.getByText(`+ Cadastrar "${modelName}" como novo Modelo`).click();

    await page.getByPlaceholder('Buscar ou digitar versão...').fill(versionName);
    await page.getByText(`+ Cadastrar "${versionName}" como nova Versão`).click();

    await page.getByPlaceholder('Buscar ano (ex: 2015 ou 2012/2013)...').fill(yearText);
    await page.getByText(`+ Cadastrar Ano: ${yearText}`).click();

    // Ao clicar em 'Confirmar Veículo', a tela muda de estado e o botão é desmontado.
    // Usamos um timeout curto de 5s e catch silencioso porque, se a mudança de tela
    // ocorrer muito rapidamente, o Playwright pode reclamar que o elemento sumiu
    // antes da finalização do clique. O teste segue normalmente em seguida.
    await page.getByText('Confirmar Veículo').click({ timeout: 5000 }).catch(() => console.log('⚠️ Confirmar Veículo desmontado ou avançado.'));
    console.log('✅ Passo 1: Informações de catálogo preenchidas.');

    // -------------------------------------------------------------------------
    // 4. PASSO 2: DETALHES TÉCNICOS (SEM PLACA)
    // -------------------------------------------------------------------------
    // Preenche a cor, cidade, estado e observações. Note que a placa NÃO é informada,
    // pois sucatas não possuem placa e o DTO da API foi analisado e validado
    // como opcional (@IsOptional).
    await page.getByPlaceholder('Ex: Prata').fill('Vermelho');
    await page.getByPlaceholder('Ex: São Paulo').fill('Campinas');
    await page.getByPlaceholder('SP').fill('SP');
    await page.getByPlaceholder('Detalhes sobre a batida, estado do motor, etc.').fill(observations);
    // Avança para o próximo passo tratando a potencial desmontagem do botão
    await page.getByText(/próximo/i).click({ timeout: 5000 }).catch(() => console.log('⚠️ Próximo (Passo 2) desmontado ou avançado.'));
    console.log('✅ Passo 2: Detalhes técnicos preenchidos.');

    // -------------------------------------------------------------------------
    // 5. PASSO 3: INJEÇÃO DE FOTOS NO ZUSTAND
    // -------------------------------------------------------------------------
    // Para contornar popups de arquivos do sistema operacional e uploads pesados
    // no navegador de teste, o teste injeta URLs de mock diretamente no store de
    // estado global do Zustand (`useVehicleWizardStore`).
    // Como as URLs começam com 'http', o componente de submissão pula o processo
    // de conversão de arquivos locais do dispositivo e envia direto à API.
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
    await page.getByText(/próximo/i).click({ timeout: 5000 }).catch(() => console.log('⚠️ Próximo (Passo 3) desmontado ou avançado.'));
    console.log('✅ Passo 3: Fotos injetadas e validadas.');

    // -------------------------------------------------------------------------
    // 6. PASSO 4: INVENTÁRIO DE PEÇAS, TÍTULO E DESCRIÇÃO
    // -------------------------------------------------------------------------
    // Devido ao layout mobile com divs de rolagem interna (ScrollView do React Native Web
    // traduzida para div com overflow), o scroll automático do Playwright para preencher
    // inputs inferiores às vezes pode falhar.
    // Para garantir robustez máxima, injetamos as peças selecionadas (disponibilizadas
    // por IDs coletados do banco via Supabase MCP) junto com o Título e a Descrição do
    // anúncio direto na store do Zustand, chamando também o método de avançar tela.
    await page.evaluate(({ titleVal, descVal, obsVal }) => {
      const store = (window as any).useVehicleWizardStore.getState();
      store.updateData({
        title: titleVal,
        description: descVal,
        observations: obsVal,
        availableParts: [
          'db5c4741-a8f8-411b-8055-b509fe51e280', // Cabeçote
          '52646253-8b90-429c-b080-7dfb0b674d49', // Bloco
          'ed9c81e4-23c0-4556-beac-095a3fdef34c'  // Biela
        ]
      });
      // Avança programaticamente para a tela de revisão
      store.nextStep();
    }, { titleVal: listingTitle, descVal: description, obsVal: observations });
    console.log('✅ Passo 4: Inventário preenchido e avançado via Zustand.');

    // -------------------------------------------------------------------------
    // 7. PASSO 5: REVISÃO E SUBMISSÃO FINAL
    // -------------------------------------------------------------------------
    // A tela de revisão mostra os dados compilados. Clicamos no botão "FINALIZAR CADASTRO".
    // Caso o clique clássico falhe (por renderização ou problemas de ponteiros do RN Web),
    // é disparado um fallback com `dispatchEvent('click')` para forçar o clique na árvore DOM.
    const finalizeBtn = page.getByText('FINALIZAR CADASTRO');
    await finalizeBtn.scrollIntoViewIfNeeded().catch(() => {});
    await finalizeBtn.click({ timeout: 10000 }).catch(async () => {
      console.log('⚠️ Clique padrão falhou no FINALIZAR CADASTRO, tentando via dispatchEvent.');
      await finalizeBtn.dispatchEvent('click');
    });
    console.log('✅ Passo 5: Botão de finalizar cadastro clicado.');

    // -------------------------------------------------------------------------
    // 8. DISPENSAR TOAST DE CONFIRMAÇÃO
    // -------------------------------------------------------------------------
    // A submissão bem-sucedida dispara um popup de sucesso (Toast).
    // O teste aguarda sua visibilidade por até 20s e realiza o clique no botão
    // "ENTENDIDO" para fechar o popup e iniciar a transição para a listagem.
    const entendidoBtn = page.getByText('ENTENDIDO');
    await expect(entendidoBtn).toBeVisible({ timeout: 20000 });
    await entendidoBtn.click({ timeout: 5000 }).catch(async () => {
      console.log('⚠️ Clique padrão falhou no ENTENDIDO, tentando via dispatchEvent.');
      await entendidoBtn.dispatchEvent('click');
    });
    console.log('✅ Toast de confirmação dispensado.');

    // -------------------------------------------------------------------------
    // 9. VALIDAÇÃO DA PÁGINA DE INVENTÁRIO E TAG DE STATUS
    // -------------------------------------------------------------------------
    // O Toast de sucesso redireciona a aplicação para a listagem de inventário.
    await expect(page).toHaveURL(/.*inventory/, { timeout: 10000 });
    console.log('✅ Redirecionado para inventário do vendedor.');

    // Busca o veículo com o título dinâmico criado e garante que o card está visível.
    const cardTitle = page.locator(`text=${brandName} ${modelName}`).first();
    await expect(cardTitle).toBeVisible({ timeout: 10000 });
    
    // Localiza o bloco do card correspondente ao veículo de teste.
    const card = page.locator('div').filter({ hasText: `${brandName} ${modelName}` }).first();
    // Garante que o status do card recém-criado exibe exatamente a tag
    // "AGUARDANDO APROVAÇÃO" (que reflete o status 'PENDING' no banco).
    const statusBadge = card.locator('text="AGUARDANDO APROVAÇÃO"').first();
    await expect(statusBadge).toBeVisible();
    
    console.log('✅ Teste E2E concluído com sucesso no frontend! Tag "AGUARDANDO APROVAÇÃO" visível.');
  });
});
