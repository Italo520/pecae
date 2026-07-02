import { test, expect } from '@playwright/test';

test.describe('Seller Onboarding and KYC Flows', () => {
  // Configura a autenticação mockada para simular um usuário logado
  test.use({
    storageState: {
      cookies: [
        {
          name: 'pecae_token',
          value: 'mock-valid-token',
          domain: 'localhost',
          path: '/',
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        }
      ],
      origins: [
        {
          origin: 'http://localhost:3005',
          localStorage: [
            {
              name: 'pecae-web-auth',
              value: JSON.stringify({
                state: {
                  user: {
                    id: '1',
                    name: 'Seller Test',
                    email: 'seller@test.com',
                    role: 'SELLER',
                    hasProfile: false
                  },
                  token: 'mock-valid-token',
                  refreshToken: 'mock-refresh-token'
                }
              })
            }
          ]
        }
      ]
    }
  });

  // Mock das chamadas de API
  test.beforeEach(async ({ page }) => {
    // Intercept API /api/auth/refresh (silent login in providers.tsx)
    // Usando substring match mais largo caso tenha /v1
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-valid-token' })
      });
    });

    // Intercept API /sellers (criação de perfil)
    await page.route('**/sellers', async (route) => {
      // Ignorar rotas de verificação aqui
      if (route.request().url().includes('/verification/')) {
        return route.fallback();
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '1', storeName: 'Test Store' })
        });
      } else {
        await route.continue();
      }
    });

    // Intercept API /sellers/verification/status (status atual)
    await page.route('**/sellers/verification/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ latestVerification: null })
      });
    });

    // Intercept API /sellers/verification/request (signed URLs)
    await page.route('**/sellers/verification/request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { uploadUrl: 'http://localhost:3005/mock-upload', path: 'documents/1.pdf' }
        ])
      });
    });

    // Mock upload URL (fake S3/Supabase upload)
    await page.route('http://localhost:3005/mock-upload', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200 });
      }
    });

    // Intercept API /sellers/verification/confirm
    await page.route('**/sellers/verification/confirm', async (route) => {
      await route.fulfill({ status: 200 });
    });
  });

  test('should complete wizard onboarding and upload kyc', async ({ page }) => {
    // Vai para a página de onboarding
    await page.goto('/vendedor/onboarding');
    await expect(page).toHaveURL(/\/vendedor\/onboarding/);

    // Etapa 1: Preencher formulário da loja
    await expect(page.getByText('PERFIL COMERCIAL')).toBeVisible();

    // Seleciona PJ
    await page.getByRole('button', { name: 'PJ' }).click();

    // Preenche campos
    await page.getByPlaceholder('00.000.000/0000-00').fill('12.345.678/0001-90');
    await page.getByPlaceholder('Ex: Ferro Velho do Juca').fill('Pecaê Test Store');
    await page.getByPlaceholder('Conte sobre suas especialidades...').fill('Loja especialista em peças de test automation.');
    await page.getByPlaceholder('(00) 0000-0000').fill('1144445555');
    await page.getByPlaceholder('(00) 90000-0000').fill('11999998888');
    await page.getByPlaceholder('Rua, número, bairro...').fill('Rua Teste, 123 - Centro');
    await page.getByPlaceholder('Ex: São Paulo').fill('São Paulo');
    await page.getByPlaceholder('SP', { exact: true }).fill('SP');
    
    // Submete o formulário
    await page.getByRole('button', { name: /PRÓXIMO: VERIFICAÇÃO/i }).click();

    // Deve redirecionar para a página de KYC
    await expect(page).toHaveURL(/\/vendedor\/solicitar-verificacao/);

    // Etapa 2: Solicitar verificação KYC
    await expect(page.getByText('SELO DE VERIFICADO')).toBeVisible();

    // Criar um arquivo mockado para o upload
    const buffer = Buffer.from('mock content');
    
    // Adicionar um ouvinte para a caixa de diálogo "alert" antes de submeter
    page.on('dialog', dialog => dialog.accept());

    // Usar o input file subjacente do react-dropzone
    await page.locator('input[type="file"]').setInputFiles({
      name: 'documento-cnh.pdf',
      mimeType: 'application/pdf',
      buffer
    });

    // O arquivo deve aparecer na lista
    await expect(page.getByText('documento-cnh.pdf')).toBeVisible();

    // Clica em enviar
    await page.getByRole('button', { name: /ENVIAR PARA ANÁLISE/i }).click();

    // O status muda e redireciona (ou exibe a tela "Em Análise"). 
    // Como mockamos o roteamento final para /vendedor/dashboard, aguardamos isso.
    await expect(page).toHaveURL(/\/vendedor\/dashboard/);
  });
});
