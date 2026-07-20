# Guia de Configuração e Execução (PECAÊ Backend - Java 25)

Este documento detalha como configurar, testar e executar a API Java do PECAÊ localmente.

## 1. Pré-requisitos
- **Java 25** (Via SDKMan ou jEnv)
- **Docker e Docker Compose** (Obrigatório para banco de dados e testes via Testcontainers)
- **Gradle** (incluso via wrapper `./gradlew`)

## 2. Configurando o Ambiente
Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```
O arquivo `.env` já vem pré-configurado para conectar na infraestrutura local do Docker. Se for conectar ao Supabase remoto, atualize as chaves.

## 3. Rodando com Docker Compose (Full-Stack Infra)
Na **raiz do projeto**, temos um `docker-compose.yml` que sobe o banco de dados (PostgreSQL), o cache (Redis) e a própria API.

```bash
# Sobe toda a infraestrutura em background
docker-compose up -d --build

# Para visualizar os logs da API
docker-compose logs -f api
```

A API estará disponível em `http://localhost:8080/`.

## 4. Rodando Local Nativo (Desenvolvimento Rápido)
Se preferir rodar a API direto no seu terminal (para debug ou hot-reload):

1. Suba apenas as dependências de infra na raiz:
   ```bash
   docker-compose up -d pecae-postgres pecae-redis
   ```
2. Inicie a aplicação Spring Boot:
   ```bash
   cd backend
   ./gradlew bootRun
   ```

Acesse o Swagger UI em: `http://localhost:8080/swagger-ui.html`

## 5. Rodando a Bateria de Testes
O projeto utiliza **Testcontainers**. Ao rodar os testes, o Gradle criará containers efêmeros de PostgreSQL e Redis automaticamente, sem conflitar com seu docker-compose.

```bash
cd backend
./gradlew test
```
*Atenção: É obrigatório ter o Docker Desktop (ou daemon Docker) rodando para os testes de integração funcionarem.*
