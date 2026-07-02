import { test, expect } from '@playwright/test';

test.describe('Seller Listing Flow', () => {
  // Configura a autenticação mockada para simular um usuário logado COM perfil completo
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
                    hasProfile: true
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
    // Intercept API /auth/refresh
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-valid-token' })
      });
    });

    // Intercept API /catalog/brands
    await page.route('**/catalog/brands', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'b1', name: 'Volkswagen' }])
      });
    });
    
    // Intercept API /catalog/brands/*/models
    await page.route('**/catalog/brands/*/models*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'm1', name: 'Gol', brandId: 'b1' }])
      });
    });

    // Intercept API /catalog/models/*/versions
    await page.route('**/catalog/models/*/versions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'ba64467c-17dc-4cf9-bb56-d0e4f55d210c', name: '1.0 MPI', modelId: 'm1', year: 2012 }])
      });
    });

    // Intercept API /vehicles (Criação)
    await page.route('**/vehicles', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '10', title: 'Sucata Gol 2020' })
        });
      } else {
        await route.continue();
      }
    });

    // Intercept API /listings/me (Criação de anúncio)
    await page.route('**/listings/me', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '20', veiculoId: '10' })
        });
      } else {
        await route.continue();
      }
    });

    // Mock file upload requests Se houver assinaturas (presigned URL)
    await page.route('**/vehicles/upload-request', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { uploadUrl: 'http://localhost:3005/mock-upload', path: 'vehicles/1.jpg' }
        ])
      });
    });
  });

  test('should complete the vehicle listing wizard', async ({ page }) => {
    // Acessa a página de criação de anúncio
    await page.goto('http://localhost:3005/vendedor/anunciar');

    // Etapa 1: Identificação
    await expect(page.getByRole('heading', { name: 'Identificação' })).toBeVisible();
    await page.getByPlaceholder('ABC-1234').fill('ABC1234');
    await page.getByPlaceholder('Ex: Prata').fill('Preto');
    await page.getByPlaceholder('Ex: São Paulo').fill('São Paulo');
    await page.getByPlaceholder('SP', { exact: true }).fill('SP');
    await page.getByPlaceholder('0').fill('50000');
    await page.locator('select[name="tipoCombustivel"]').selectOption('GASOLINA');
    await page.getByRole('button', { name: 'Próximo Passo' }).click();

    // Etapa 2: FIPE
    await expect(page.getByRole('heading', { name: 'Tabela FIPE' })).toBeVisible();
    await page.locator('select').nth(0).selectOption({ label: 'Volkswagen' });
    await page.locator('select').nth(1).selectOption({ label: 'Gol' });
    await page.locator('select').nth(2).selectOption({ label: '1.0 MPI' });
    await page.locator('select').nth(3).selectOption({ label: '2012 - Flex' });
    await page.getByRole('button', { name: 'Próximo Passo' }).click();

    // Etapa 3: Peças
    await expect(page.getByRole('heading', { name: 'Peças Intactas' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Motor e Componentes' }).check({ force: true });
    await page.getByRole('checkbox', { name: 'Câmbio e Transmissão' }).check({ force: true });
    await page.getByRole('button', { name: 'Próximo Passo' }).click();

    // Etapa 4: Fotos
    await expect(page.getByRole('heading', { name: 'Fotos do Veículo' })).toBeVisible();
    // Simula upload de foto
    await page.setInputFiles('input[type="file"]', {
      name: 'carro.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    });
    // Aguarda visualização (mock)
    await page.getByRole('button', { name: 'Próximo Passo' }).click();

    // Etapa 5: Revisão Final
    await expect(page.getByRole('heading', { name: 'Revisão Final' })).toBeVisible();
    await page.getByPlaceholder('Ex: Motor fundido, mas lataria e câmbio em perfeito estado. Baixa definitiva em andamento.').fill('Sucata de gol para retirada de peças');

    // Aceita diálogos se houver (por ex: success alert)
    page.on('dialog', dialog => dialog.accept());

    // Submit
    await page.getByRole('button', { name: 'Finalizar e Anunciar' }).click();

    // Redirecionamento esperado para o dashboard
    await expect(page).toHaveURL(/\/vendedor\/dashboard/);
  });
});
