const fetch = require('node-fetch');

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3333/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller-e2e@pecae.com.br', password: 'Pecae@E2e123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.tokens.accessToken;
    console.log('Login Token:', token ? 'OK' : 'Failed');

    const payload = {
      versaoId: "b08c2f24-fb7f-4497-95e9-7d968c9773c6",
      anoId: "ea519f5d-17dc-4cf9-bb56-d0e4f55d210b",
      placa: "E2E9A98",
      cor: "Azul",
      cidade: "Santos",
      estado: "SP",
      tipoCombustivel: "FLEX",
      quilometragem: 12000,
      pecasDisponiveis: ["engine", "transmission"],
      observacoes: "Observação E2E de teste"
    };

    console.log('Sending payload:', JSON.stringify(payload));

    const createRes = await fetch('http://localhost:3333/api/v1/vehicles', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('Create status:', createRes.status);
    const createData = await createRes.json();
    console.log('Create response body:', JSON.stringify(createData, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
