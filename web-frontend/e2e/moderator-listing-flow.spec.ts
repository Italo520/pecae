import { test, expect } from '@playwright/test';

test.describe('Moderator Listing Flow', () => {
  // Configura a autenticação mockada para simular um usuário logado como MODERADOR
  test.use({
    storageState: {
      cookies: [
        {
          name: 'pecae_token',
          value: 'mock-moderator-token',
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
                    id: 'mod1',
                    name: 'Moderator Admin',
                    email: 'moderator@test.com',
                    role: 'ADMIN',
                    type: 'MODERATOR'
                  },
                  token: 'mock-moderator-token',
                  refreshToken: 'mock-refresh-token'
                }
              })
            }
          ]
        }
      ]
    }
  });

  const mockListings = [
    {
      id: 'listing1',
      veiculoId: 'veh1',
      titulo: 'Sucata Gol 2020',
      descricao: 'Batido de frente',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      veiculo: {
        id: 'veh1',
        marcaNome: 'Volkswagen',
        modeloNome: 'Gol',
        versaoNome: '1.0 MPI',
        ano: 2020,
        mainImage: null
      },
      vendedor: {
        id: 'seller1',
        nomeFantasia: 'Desmanche do Zé',
        email: 'ze@desmanche.com'
      }
    },
    {
      id: 'listing2',
      veiculoId: 'veh2',
      titulo: 'Sucata Civic 2018',
      descricao: 'Batido traseira',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      veiculo: {
        id: 'veh2',
        marcaNome: 'Honda',
        modeloNome: 'Civic',
        versaoNome: 'EXL',
        ano: 2018,
        mainImage: null
      },
      vendedor: {
        id: 'seller2',
        nomeFantasia: 'Auto Peças Honda',
        email: 'honda@autopecas.com'
      }
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Intercept API /auth/refresh
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-moderator-token' })
      });
    });

    // Mock das listagens pendentes
    await page.route('**/moderation/listings?status=PENDING', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: mockListings,
          total: mockListings.length,
          page: 1,
          size: 10
        })
      });
    });

    // Mock das actions
    await page.route('**/moderation/listings/*/approve', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.route('**/moderation/listings/*/reject', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
  });

  test('should display the moderation table and allow bulk approve', async ({ page }) => {
    await page.goto('http://localhost:3005/moderador/anuncios');

    // Verifica se os itens renderizaram
    await expect(page.getByText('Sucata Gol 2020')).toBeVisible();
    await expect(page.getByText('Desmanche do Zé')).toBeVisible();
    await expect(page.getByText('Sucata Civic 2018')).toBeVisible();

    // Seleciona o primeiro
    const checkboxes = page.getByRole('checkbox');
    // checkbox[0] = toggleAll, checkbox[1] = listing1, checkbox[2] = listing2
    await checkboxes.nth(1).check();
    await expect(page.getByText('1 selecionados')).toBeVisible();

    // Aprovar em lote
    await page.locator('.animate-in').getByRole('button', { name: 'Aprovar' }).click();

    // A fila deve atualizar, o item some (simulado pela refetch - aqui continuará o mock, 
    // mas o selecionado deve zerar).
    await expect(page.getByText('1 selecionados')).not.toBeVisible();
  });

  test('should allow individual reject with mandatory reason', async ({ page }) => {
    await page.goto('http://localhost:3005/moderador/anuncios');

    await expect(page.getByText('Sucata Gol 2020')).toBeVisible();

    // Clica em rejeitar individual no primeiro item
    // Os botões estão em <td className="text-right">...
    // Como são ícones svg sem label, vamos pegar pelo atributo title.
    await page.locator('button[title="Rejeitar"]').first().click();

    // Modal de rejeição aparece
    const modal = page.locator('div[role="dialog"]').or(page.locator('h3:has-text("Rejeitar Anúncio(s)")'));
    await expect(modal).toBeVisible();

    // Botão de submeter deve estar desabilitado no inicio (campo vazio)
    const btnSubmit = page.getByRole('button', { name: 'Confirmar Rejeição' });
    await expect(btnSubmit).toBeDisabled();

    // Preenche o motivo
    await page.getByLabel('Motivo da Rejeição *').fill('Fotos ilegíveis');
    
    // Agora deve estar habilitado
    await expect(btnSubmit).toBeEnabled();

    // Confirma
    await btnSubmit.click();

    // Modal fecha
    await expect(modal).not.toBeVisible();
  });
});
