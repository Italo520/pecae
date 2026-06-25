# PECAÊ Backend (Spring Boot 3.5 / Java 25)

Bem-vindo ao repositório do backend do PECAÊ, uma plataforma C2C focada em autopeças de sucatas. O backend foi integralmente migrado de NestJS para **Java 25** utilizando **Spring Boot**.

## 🚀 Arquitetura e Stack Tecnológica
- **Linguagem:** Java 25
- **Framework:** Spring Boot 3.5+
- **Banco de Dados:** PostgreSQL 16
- **ORM:** Spring Data JPA (Hibernate)
- **Cache e Mensageria:** Redis
- **Migrações:** Flyway
- **Mapeamento DTO:** MapStruct
- **Segurança:** Spring Security com JWT estrito
- **Documentação da API:** Swagger (SpringDoc OpenAPI 3)
- **Testes:** JUnit 5, Mockito e Testcontainers

## ⚙️ Funcionalidades Mapeadas e Migradas (Fases 1-14)
- Autenticação e Autorização JWT (Múltiplos papéis).
- Gerenciamento de Perfis (Comprador e Vendedor).
- Catálogo C2C completo (Marcas, Modelos, Anos).
- CRUD e State Machine de Veículos de Sucata e Anúncios de Peças.
- Sistema de Mensagens (Chat em tempo real com WebSockets).
- Moderação de Plataforma e Denúncias.
- Sistema de Favoritos e Buscas Salvas.
- Push Notifications via Expo.
- Analytics e Sistema de Publicidade Avançado (Ads/Banners).

## 🛠️ Como Iniciar
Para rodar a aplicação localmente e ver a API funcionando, consulte nosso guia de setup completo no arquivo abaixo:

👉 **[Ler o SETUP.md](./SETUP.md)**

## 📜 Documentação da API (Swagger)
Com o sistema rodando, a documentação interativa da API está disponível em:
`http://localhost:8080/swagger-ui.html`
