# Risks & Technical Concerns

**Analysis Date:** 2026-05-24

Este documento serve como mapa de riscos técnicos, pontos de gargalo conhecidos, fragilidades arquiteturais e diretrizes de mitigação preventiva para o ecossistema **PECAÊ**.

---

## 📱 1. Conectividade e Portas no Ambiente de Desenvolvimento Mobile

### 1.1 Conflito de Portas no Host
* **Risco:** O monorepo orquestrado com Docker Compose expõe portas cruciais no host (Postgres: `5432`, Redis: `6379`, API NestJS: `3000`, Expo Web/Mobile: `8080`). Se outro serviço local (como um banco de dados local rodando na máquina física ou outro servidor web) estiver usando alguma dessas portas, a inicialização do container falhará (`address already in use`).
* **Mitigação:** Antes de iniciar o Docker Compose, verificar processos na porta com `lsof -i :8080` (ou porta correspondente) e finalizá-los, ou ajustar o arquivo `docker-compose.yml` para mapear para portas alternativas não concorrentes no host.

### 1.2 Loopback de Rede nos Emuladores
* **Risco:** Emuladores Android virtualizados não conseguem resolver `localhost` ou `127.0.0.1` apontando para a API NestJS rodando na máquina física, resultando em erros constantes de `Network Error` (ERR_CONNECTION_REFUSED).
* **Mitigação:** 
  - Para o **Android Emulator**, o `.env` do mobile deve apontar obrigatoriamente para `10.0.2.2:3000`.
  - Para testes em **dispositivos físicos via Expo Go**, o mobile e a API NestJS devem apontar para o IP privado da rede local sem fio comum (ex: `192.168.1.XX:3000`).

---

## 🗄️ 2. Exaustão de Conexões com o Banco de Dados (Prisma Pool)

### 2.1 Conexões Excessivas no Supabase PostgreSQL
* **Risco:** O Prisma ORM abre conexões em pool por padrão para otimizar queries. Sob tráfego concorrente ou deploys múltiplos na nuvem (Serverless / Auto-scaling), o limite de conexões simultâneas do PostgreSQL do Supabase pode ser atingido rapidamente, disparando erros do Prisma (`P2024: Connection pool timeout`).
* **Mitigação:**
  - Configurar explicitamente parâmetros de tamanho de pool na Connection String (ex: `?connection_limit=10`).
  - Em produção com Serverless, utilizar a URL de conexão direcionada para o **Supabase Connection Pooler** (Supavisor na porta `6543` no modo `transaction`), mantendo a porta `5432` direta apenas para migrações via `DIRECT_URL`.

---

## 🔄 3. Loop de Exaustão e Renovações Infinitas de Sessão (Axios Interceptors)

### 3.1 Loop Infinito de Refresh Token
* **Risco:** Se o Refresh Token for revogado ou expirar, a requisição de renovação de token da API falhará com erro `401 Unauthorized`. Se o interceptor do Axios no Mobile não for extremamente resiliente, ele tentará interceptar o próprio erro do refresh repetidamente, gerando um loop de requisições infinitas que trava a CPU do aparelho e sobrecarrega a API.
* **Mitigação:**
  - Garantir uma checagem estrita no interceptor: se a própria URL de refresh token retornar `401/403`, interrompa o fluxo imediatamente.
  - Limpar imediatamente o estado de autenticação global (`authStore.getState().logout()`), limpar as chaves no Expo Secure Store e forçar o redirecionamento rígido do usuário para a tela inicial de login com um aviso amigável.

---

## ⚡ 4. Gargalos em Filas de Processamento (Redis e BullMQ)

### 4.1 Jobs Travados ou Duplicados (Stalled Jobs)
* **Risco:** Operações de banco pesadas ou lentas executadas por workers (como processar em lote logs analíticos de ads ou criar dezenas de itens de catalogação) podem ultrapassar o tempo limite do lock do BullMQ (`lockDuration`). Isso faz com que o BullMQ considere que o worker travou, relançando o mesmo job em outro worker, o que gera processamentos duplicados e locks concorrentes no banco.
* **Mitigação:**
  - Otimizar as queries dentro do `Processor` do BullMQ para que durem menos de 5 segundos.
  - Habilitar o tratamento correto de *graceful shutdown* nos processos NestJS para que finalizem os jobs em execução ou liberem os locks ao receber sinais de reinicialização (`SIGTERM` / `SIGINT`).

### 4.2 Vazamento de Memória por TTL Ausente no Redis
* **Risco:** Armazenar dados temporários de contagem de views, sessões curtas e IPs anti-fraude sem prazo de expiração (TTL - Time to Live) fará com que a memória do Redis cresça indefinidamente até a exaustão total do servidor.
* **Mitigação:** Toda inserção de cache temporário no Redis deve ter uma expiração explícita definida no comando (ex: TTL de 24 horas para contadores de views únicas de anúncios por IP).

---

## 📈 5. Gargalos Analíticos de Desnormalização no PostgreSQL

### 5.1 Latência em Agregações de Reputação e Estatísticas
* **Risco:** As tabelas `SellerStats` (estatísticas de vendas e tempo de resposta) e os contadores de anúncios (favoritos, contagem de views) exigem agregação de dados. Realizar queries de soma (`SUM`) ou contagem (`COUNT`) em tempo de execução para cada busca causará lentidão drástica conforme o banco cresce.
* **Mitigação:**
  - Manter contadores denormalizados atualizados de forma assíncrona por transações ou jobs em segundo plano periódicos.
  - Criar views materializadas (`Materialized Views`) ou caches específicos para dados que não precisam ser perfeitamente atualizados a cada segundo (ex: estatísticas mensais de lojistas).

---

*Technical risk profile verified: 2026-05-24*
