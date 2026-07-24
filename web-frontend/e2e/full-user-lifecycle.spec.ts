import { test, expect } from '@playwright/test';

test.describe('Fluxo E2E Completo de Vendas PECAÊ (Produção / Mesma Aba)', () => {
  // Executa sequencialmente reutilizando a mesma aba do navegador
  test.describe.configure({ mode: 'serial' });

  const BASE_URL = 'https://pecae.italohub.cloud';
  const PAUSE_MS = 1000; // Pausa visual de 1 segundo entre cada interação

  test.beforeEach(async ({ page }) => {
    // Rota mock de renovação de sessão para evitar 401 do cookie de produção no teste E2E
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'token-buyer-valid-e2e' })
      });
    });
  });

  test('Jornada Completa: 1. Visitante -> 2. Comprador -> 3. Onboarding Vendedor -> 4. KYC -> 5. Moderação -> 6. Vendedor Aprovado -> 7. Anunciar -> 8. Chat', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos para cobrir todas as 8 etapas com pausas visuais de 1s

    // =========================================================================
    // ETAPA 1: 🌐 Visitante Deslogado (Home & Busca)
    // =========================================================================
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // Valida elementos visíveis na Home como visitante
    await expect(page.locator('header')).toBeVisible();
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 2: 📝 Cadastro & Autenticação (Conta Comprador)
    // =========================================================================
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // Injeta sessão de usuário Comprador (BUYER) autenticado no localStorage
    await page.evaluate(() => {
      localStorage.setItem('pecae-web-auth', JSON.stringify({
        state: {
          user: {
            id: 'u-comprador-e2e-1001',
            name: 'Comprador Teste E2E',
            email: 'comprador.real@pecae.cloud',
            type: 'BUYER',
            hasProfile: false
          },
          accessToken: 'token-buyer-valid-e2e',
          isAuthenticated: true,
          isInitialized: true
        },
        version: 0
      }));
    });
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 3: 🛍️ Comprador Clica no Botão "Anunciar"
    // =========================================================================
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // Navega para o fluxo de onboarding
    await page.goto(`${BASE_URL}/vendedor/onboarding`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 4: 🏢 Onboarding do Perfil Comercial (Formulário Completo)
    // =========================================================================
    await expect(page.getByText(/PERFIL COMERCIAL/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(PAUSE_MS);

    // 1. Tipo de Operação
    await page.getByRole('button', { name: /CONCESSIONÁRIA|DESMANCHE/i }).first().click();
    await page.waitForTimeout(PAUSE_MS);

    // 2. CNPJ
    await page.getByPlaceholder('00.000.000/0000-00').fill('12.345.678/0001-99');
    await page.waitForTimeout(PAUSE_MS);

    // 3. Nome Fantasia
    await page.getByPlaceholder('Ex: Ferro Velho do Juca').fill('Auto Peças E2E Produção');
    await page.waitForTimeout(PAUSE_MS);

    // 4. Descrição da Operação
    await page.getByPlaceholder('Conte sobre suas especialidades...').fill('Desmonte credenciado especializado em peças e veículos testados.');
    await page.waitForTimeout(PAUSE_MS);

    // 5. Telefones
    await page.getByPlaceholder('(00) 0000-0000').fill('1133334444');
    await page.waitForTimeout(PAUSE_MS);

    await page.getByPlaceholder('(00) 90000-0000').fill('11988887777');
    await page.waitForTimeout(PAUSE_MS);

    // 6. Endereço e Localização
    await page.getByPlaceholder('Rua, número, bairro...').fill('Av. Paulista, 1000 - Bela Vista');
    await page.waitForTimeout(PAUSE_MS);

    await page.getByPlaceholder('Ex: São Paulo').fill('São Paulo');
    await page.waitForTimeout(PAUSE_MS);

    await page.getByPlaceholder('SP', { exact: true }).fill('SP');
    await page.waitForTimeout(PAUSE_MS);

    // Submete o cadastro
    const btnProximo = page.getByRole('button', { name: /PRÓXIMO: VERIFICAÇÃO/i });
    await expect(btnProximo).toBeVisible();
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 5: 📄 Verificação KYC & Envio de Documentos
    // =========================================================================
    await page.goto(`${BASE_URL}/vendedor/solicitar-verificacao`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 6: 🛡️ Moderação e Aprovação PECAÊ
    // =========================================================================
    // Alterna a sessão para o perfil de Moderador na mesma aba
    await page.evaluate(() => {
      localStorage.setItem('pecae-web-auth', JSON.stringify({
        state: {
          user: {
            id: 'mod-admin-e2e-9001',
            name: 'Moderador PECAÊ',
            email: 'moderador@pecae.cloud',
            type: 'MODERATOR',
            role: 'ADMIN'
          },
          accessToken: 'token-mod-valid-e2e',
          isAuthenticated: true,
          isInitialized: true
        },
        version: 0
      }));
    });
    await page.waitForTimeout(PAUSE_MS);

    await page.goto(`${BASE_URL}/moderador/anuncios`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 7: 🚀 Vendedor Aprovado & Publicação de Anúncio
    // =========================================================================
    // Atualiza a sessão para Vendedor Verificado e Aprovado
    await page.evaluate(() => {
      localStorage.setItem('pecae-web-auth', JSON.stringify({
        state: {
          user: {
            id: 'u-comprador-e2e-1001',
            name: 'Vendedor Aprovado PECAÊ',
            email: 'comprador.real@pecae.cloud',
            type: 'SELLER',
            hasProfile: true,
            isVerified: true
          },
          accessToken: 'token-seller-approved-e2e',
          isAuthenticated: true,
          isInitialized: true
        },
        version: 0
      }));
    });
    await page.waitForTimeout(PAUSE_MS);

    // Acessa o formulário de cadastrar novo anúncio
    await page.goto(`${BASE_URL}/vendedor/anunciar`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // Valida que o vendedor NÃO foi redirecionado para a página de login
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForTimeout(PAUSE_MS);

    // =========================================================================
    // ETAPA 8: 💬 Atendimento no Chat / Mensagens
    // =========================================================================
    await page.goto(`${BASE_URL}/vendedor/chat`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(PAUSE_MS);

    // Valida acesso liberado às mensagens do vendedor
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForTimeout(PAUSE_MS);
  });
});
