# Resumo da Jornada E2E Web da PECAÊ

## O que foi feito
A jornada completa de testes Web End-to-End foi executada com absoluto sucesso, garantindo a qualidade da usabilidade na perspectiva do navegador (Playwright), integrando perfeitamente a API backend rodando em Docker e os containers do Next.js.

### Melhorias Implementadas
- **Orquestração Inteligente (`run-journey.ps1`)**: Script em PowerShell capaz de agrupar todos os arquivos de teste de fluxo (`guest`, `identity`, `vendedor`, `moderador`, `core`, `missing-flows`, `rbac`) numa única fila sequencial transparente, com Healthcheck robusto de API (Porta 3333).
- **Testes Otimizados (`combined-missing-flows.spec.ts`)**: Aglutinamos as jornadas faltantes (Chat/Negociação e Patrocinados/Cota) na mesma aba persistente (`test.describe.serial`), reduzindo enormemente a penalidade de processamento para rodar testes.
- **Resolução Crítica de Banco de Dados**: Solucionado um gargalo letal no PostgreSQL (Supabase) via `@ColumnTransformer` em entidades do Spring Boot como `Anuncio` e `FotoVeiculo`, juntamente da exclusão profilática de scripts customizados com `CAST` recursivos que derrubavam a API remota.
- **Cache Invalidation for Tests**: Adequado a página Home do Next.js (`page.tsx`) com a flag `force-dynamic` para garantir validação instantânea dos novos anúncios aprovados pela Moderação E2E, sem colidir com as políticas de _ISR_ locais.

## Como Validar
Para rodar a bateria inteira por conta própria:
```powershell
powershell -ExecutionPolicy Bypass -File .\web-e2e\run-journey.ps1
```

> [!NOTE]
> Os testes simulam de forma visual, em uma única aba limpa (Chromium Headed), toda a experiência que os compradores, vendedores e moderadores terão em produção. Tudo finalizou em sucesso (🎉)!
