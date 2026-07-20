import { test, expect } from '@playwright/test';
import * as http from 'http';

test.describe('Buyer Experience Flow', () => {
  let mockServer: http.Server;

  // Configura a autenticação mockada para simular um usuário logado como BUYER
  test.use({
    storageState: {
      cookies: [
        {
          name: 'pecae_token',
          value: 'mock-buyer-token',
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
                    id: 'buyer1',
                    name: 'Comprador Teste',
                    email: 'buyer@test.com',
                    role: 'BUYER',
                    type: 'BUYER'
                  },
                  token: 'mock-buyer-token',
                  refreshToken: 'mock-refresh-token'
                }
              })
            }
          ]
        }
      ]
    }
  });

  const mockListingDetail = {
    id: 'listing101',
    veiculoId: 'veh100',
    titulo: 'Sucata Civic 2018 EXL Completo',
    descricao: 'Carro com baixa no detran, motor intacto.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nomeVendedor: 'Desmanche do Zé',
    pecasDisponiveis: ['Motor', 'Câmbio'],
    veiculo: {
      id: 'veh100',
      marcaNome: 'Honda',
      modeloNome: 'Civic',
      versaoNome: 'EXL',
      ano: 2018,
      cor: 'Preto',
      preco: 15000,
      cidade: 'São Paulo',
      estado: 'SP',
      quilometragem: 45000,
      tipoCombustivel: 'FLEX',
      mainImage: null,
      pecasDisponiveis: ['Motor', 'Câmbio']
    },
    vendedor: {
      id: 'seller1',
      nomeFantasia: 'Desmanche do Zé',
      email: 'ze@desmanche.com',
      avatar: null,
      rating: 4.8
    },
    fotos: [{ id: '1', url: 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg', isMain: true }]
  };

  test.beforeAll(() => {
    // Start a mock server for Next.js SSR fetch calls
    mockServer = http.createServer((req, res) => {
      // Configurar CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      console.log('MockServer received request:', req.method, req.url);

      if (req.url?.includes('/api/v1/listings/listing101')) {
        res.writeHead(200);
        res.end(JSON.stringify(mockListingDetail));
      } else if (req.url?.includes('/api/v1/listings?size')) {
        res.writeHead(200);
        res.end(JSON.stringify({ content: [mockListingDetail] }));
      } else if (req.url?.includes('/api/v1/catalog/categories')) {
        res.writeHead(200);
        res.end(JSON.stringify([]));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });
    mockServer.listen(3344, '127.0.0.1');
  });

  test.afterAll(() => {
    mockServer.close();
  });

  const mockChat = {
    id: 'chat1',
    listingId: 'listing100',
    buyerId: 'buyer1',
    sellerId: 'seller1',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    atualizadaEm: new Date().toISOString(),
    listing: mockListingDetail,
    seller: mockListingDetail.vendedor,
    tituloDaConversa: mockListingDetail.titulo,
    naoLidos: 0,
    interlocutor: {
      id: mockListingDetail.vendedor.id,
      nome: mockListingDetail.vendedor.nomeFantasia,
      avatar: mockListingDetail.vendedor.avatar
    }
  };

  const mockMessages = [
    {
      id: 'msg1',
      salaId: 'chat1',
      remetenteId: 'buyer1',
      conteudo: 'Olá, o motor está funcionando?',
      criadaEm: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'msg2',
      salaId: 'chat1',
      remetenteId: 'seller1',
      conteudo: 'Sim, motor intacto e testado!',
      criadaEm: new Date(Date.now() - 30000).toISOString()
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Intercept API /auth/refresh
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-buyer-token' })
      });
    });

    // Mock do anúncio
    await page.route('**/listings/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockListingDetail)
      });
    });

    // Mock do POST para iniciar/recuperar chat e GET para listar chats
    await page.route(/.*\/chat\/rooms$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          contentType: 'application/json',
          body: JSON.stringify(mockChat)
        });
      } else if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': '*' },
          body: ''
        });
      } else {
        // GET
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          contentType: 'application/json',
          body: JSON.stringify([mockChat])
        });
      }
    });

    // Mock do GET de um chat específico (usado na tela de chat)
    await page.route(/.*\/chat\/rooms\/chat1$/, async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify(mockChat)
      });
    });

    // Mock de mensagens (GET e POST)
    await page.route(/.*\/chat\/rooms\/chat1\/messages.*/, async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON() || {};
        await route.fulfill({
          status: 201,
          headers: { 'Access-Control-Allow-Origin': '*' },
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'msg3',
            salaId: 'chat1',
            remetenteId: 'buyer1',
            conteudo: postData.conteudo || postData.content,
            criadaEm: new Date().toISOString()
          })
        });
      } else if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': '*' },
          body: ''
        });
      } else {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          contentType: 'application/json',
          body: JSON.stringify({
            itens: mockMessages,
            proximoCursor: null
          })
        });
      }
    });
  });

  test('should view listing details and start chat', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds timeout
    
    // Injeta flag para mockar conexão STOMP no useStomp.ts
    await page.addInitScript(() => {
      (window as any).E2E_MOCK_STOMP = true;
    });
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Acessa a página de detalhes do veículo/anúncio
    // O mock usa id listing101
    await page.goto('http://localhost:3005/veiculo/listing101');

    // Verifica se as informações vitais estão na tela
    const text = await page.innerText('body');
    console.log('PAGE TEXT:', text);
    await expect(page.getByText('Sucata Civic 2018 EXL Completo')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Desmanche do Zé')).toBeVisible();
    await expect(page.getByText('Motor', { exact: true })).toBeVisible(); // Peças

    // Clica no botão para enviar mensagem / fazer proposta
    // Pode ser um botão "Enviar Mensagem", "Fazer Proposta" ou "Chat"
    const startChatBtn = page.getByRole('button', { name: /Enviar Mensagem|Fazer Proposta|Iniciar Chat/i });
    await expect(startChatBtn).toBeVisible();
    await startChatBtn.click();

    // 2. Verifica se foi redirecionado para a tela de chat
    await expect(page).toHaveURL(/\/comprador\/negociacoes\/chat1/, { timeout: 15000 });

    // 3. Testa a tela de chat
    // Verifica mensagens anteriores
    await expect(page.getByText('Olá, o motor está funcionando?')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Sim, motor intacto e testado!')).toBeVisible();

    // Envia nova mensagem
    const messageInput = page.locator('textarea');
    await expect(messageInput).toBeVisible();
    await messageInput.fill('Qual o menor valor à vista?');
    
    // Clica no botão de enviar
    const sendBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await sendBtn.click();

    // A mensagem nova deve aparecer na tela (mockada e tratada no UI optimism)
    await expect(page.getByText('Qual o menor valor à vista?')).toBeVisible();
  });
});
