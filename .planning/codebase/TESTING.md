# Testing Strategy

**Analysis Date:** 2026-05-24

Este documento define a estratégia de testes, pirâmide de automação, padrões de escrita e ferramentas de asserção adotadas no projeto **PECAÊ** para garantir a estabilidade e a prevenção de regressões no ecossistema.

---

## 📐 1. A Pirâmide de Testes no PECAÊ

Adotamos uma abordagem pragmática para a suíte de testes, equilibrando velocidade de execução e confiança nas entregas.

```text
  /\
 /  \     Testes E2E / Integração Global (Confiança Extrema / Lentos)
/----\
/      \   Testes de Integração API/UI (Foco em Fluxos e Regras de Negócio)
/--------\
/          \ Testes Unitários (Velocidade Extrema / Mocks Isolados)
/------------\
```

---

## 🎛️ 2. Testes de Backend (NestJS & Prisma)

A API central possui duas frentes robustas de testes: unitários (Jest) e End-to-End (E2E) via Supertest.

### 2.1 Testes Unitários
* **Foco:** Regras de negócio contidas nos serviços (`.service.ts`) e comportamentos isolados de Guards e Pipes.
* **Ferramenta:** `Jest` nativo com `@nestjs/testing`.
* **Mocking:** É obrigatório isolar a camada de banco de dados. Utilizamos `jest-mock-extended` ou mocks customizados para simular o comportamento do Prisma Client sem tocar no banco de dados real.
* **Padrão de Código:**
```typescript
describe('SellerProfileService', () => {
  let service: SellerProfileService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = { sellerProfile: { findUnique: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        SellerProfileService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SellerProfileService>(SellerProfileService);
  });

  it('deve retornar perfil de vendedor por id', async () => {
    // Arrange
    const mockProfile = { id: '1', storeName: 'Sucata do Zé' };
    prismaMock.sellerProfile.findUnique.mockResolvedValue(mockProfile);

    // Act
    const result = await service.getProfile('1');

    // Assert
    expect(result).toEqual(mockProfile);
    expect(prismaMock.sellerProfile.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
```

### 2.2 Testes End-to-End (E2E)
* **Foco:** Rotas HTTP completas da API, garantindo o ciclo de middleware, validação de DTOs, interceptors, autenticação e resposta.
* **Ferramentas:** `@nestjs/testing` e `supertest`.
* **Ambiente:** Executados de forma isolada apontando para um banco de dados temporário de testes ou banco limpo.
* **Execução:** Configurados em `apps/api/test/jest-e2e.json` e executados via:
  `npm run test:e2e --workspace=apps/api`

---

## 📱 3. Testes de Mobile (React Native & Expo)

O aplicativo móvel foca em testes de componentes de interface e hooks customizados.

### 3.1 Testes de UI e Componentes
* **Foco:** Validar a renderização correta de botões, inputs, cards e feedbacks visuais em tela.
* **Ferramentas:** `@testing-library/react-native` e `react-test-renderer` sob o ecossistema `jest-expo`.
* **Asserções:** Validação de renderização condicional (ex: se o botão de "Aprovar" aparece apenas para moderadores).

### 3.2 Testes de Hooks e Lógica
* **Foco:** Testar lógica interna de stores (Zustand) e hooks assíncronos.
* **Ferramentas:** `renderHook` da Testing Library.
* **Mocks de Rede:** Qualquer chamada externa de API feita pelo Axios deve ser interceptada com `jest.spyOn` ou mocks explícitos para evitar requisições reais para servidores externos na suíte de testes.

---

## 📑 4. O Padrão AAA (Arrange, Act, Assert)

Para manter a consistência e a facilidade de leitura dos testes, toda a equipe deve seguir a estrutura AAA:

1. **Arrange (Organizar):** Configura os mocks, instancia variáveis e prepara o cenário de entrada do teste.
2. **Act (Agir):** Executa o método ou a rota que está sendo especificamente testada.
3. **Assert (Asserir):** Valida os resultados obtidos confrontando com as expectativas (expect) e verifica se as chamadas de dependências foram executadas conforme planejado.

---

## 🚀 5. Automação e Comandos de Execução

O Turborepo otimiza a execução dos testes em paralelo utilizando caches inteligentes.

* **Executar todos os testes do Monorepo:**
  `npx turbo run test`
* **Testes unitários com Watch (desenvolvimento ativo):**
  `npm run test:watch --workspace=apps/api`
* **Gerar cobertura de testes do backend:**
  `npm run test:cov --workspace=apps/api`

### 5.1 Regra de Mocking Obrigatório de APIs Externas
Durante os testes de unidade ou integração, chamadas de rede reais para APIs terceiras **são proibidas**. É obrigatório mocar:
* Métodos do gateway **Stripe** para evitar faturamento real.
* Chamadas de disparo de e-mail do **Resend**.
* Requisições e sessões diretas do SDK do **Supabase**.

---

*Testing standards certified: 2026-05-24*
