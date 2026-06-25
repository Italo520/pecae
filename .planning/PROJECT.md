# PROJECT.md

> **Versão Expedida:** v9.0 (Milestone 9)  
> **Status Geral:** Todas as Milestones de 1 a 9 foram concluídas e arquivadas com sucesso. A migração total do backend para Java e a validação ponta a ponta (E2E) no Frontend foram finalizadas com sucesso. O backend legado em Node.js foi inteiramente removido.  
> **Foco Atual:** Preparação para Milestone 10 (Funcionalidades adicionais, OpenSearch, etc) e deploy de produção em nuvem.


## Visão Geral do Sistema PECAÊ

O PECAÊ é uma plataforma de marketplace para comércio de peças automotivas oriundas de sucatas/desmanches. O sistema conecta compradores e vendedores através de uma interface baseada no Design System **The Digital Forge** (com forte uso de Glassmorphism e foco em alta performance).

### Módulos do Sistema

- **M01 - Autenticação e Cadastro** (P0): Módulo responsável por todo o ciclo de identidade do usuário: cadastro, autenticação, verificação, recuperação de senha e gestão de sessão. É a fundação de toda a plataforma — todos os módulos dependem deste.
- **M02 - Perfil do Comprador** (P1): Módulo responsável pelo perfil pessoal do comprador: dados básicos, avatar, acesso ao histórico de favoritos, buscas salvas, conversas de chat e preferências de notificação. Perfil simples e centrado na experiência de busca e negociação.
- **M03 - Perfil do Vendedor** (P0): Módulo responsável pela criação, edição e exibição do perfil público do vendedor (desmanche). Inclui dados da loja (nome, tipo PF/PJ, endereço, horário, logo), processo de solicitação de verificação (Selo Verificado), e estatísticas de qualidade (tempo de resposta médio, anúncios ativos, avaliações).
- **M04 - Catálogo Automotivo** (P0): Módulo responsável pelo catálogo de veículos da plataforma: marcas, modelos, versões, anos e categorias fixas de peças (PartCategory). É infraestrutura base para os módulos M05 (Cadastro de Sucata) e M07 (Busca e Descoberta). Dados gerenciados exclusivamente pelo administrador.
- **M05 - Cadastro de Sucata / Veículo** (P0): Módulo responsável pelo cadastro, edição e gestão de sucatas (veículos completos). Vendedor cadastra um veículo completo com fotos e marca quais peças estão disponíveis usando lista fixa de PartCategory. Todo anúncio criado ou editado obrigatoriamente entra em fila de moderação antes de ser publicado (RN14).
- **M06 - Avaliações e Reputação** (P1): Módulo de avaliação de vendedores após uma negociação concluída. Comprador avalia o vendedor com nota (1-5 estrelas) e comentário opcional. Rating média exibida publicamente no perfil do vendedor (M03). Busca de sucatas pode ordenar por rating. Vendedor não avalia comprador nesta versão.
- **M07 - Busca e Descoberta** (P0): Módulo responsável pela busca e descoberta de sucatas no PECAÊ. Comprador pesquisa por veículo (marca → modelo → ano) e opcionalmente por localização e texto livre (nome da peça). Resultados retornam SEMPRE sucatas completas (veículos), nunca peças avulsas. Usa PostgreSQL Full-Text Search no MVP e migração para OpenSearch na Fase 2.
- **M08 - Chat e Negociação** (P0): Módulo de comunicação em tempo real entre comprador e vendedor usando Supabase Realtime. Toda negociação ocorre exclusivamente via chat vinculado a um anúncio específico. Não há preços, transações financeiras ou pagamentos no chat — é apenas a interface de negociação textual. Chat só pode ser iniciado em anúncios com status PUBLISHED (RN11).
- **M09 - Painel de Moderação** (P0): Painel de moderação exclusivo para Admins/Moderadores da equipe PECAÊ. Responsável pela aprovação ou rejeição de anúncios cadastrados pelos vendedores (RN14). Central de revisão de documentos de verificação (Selo Verificado, M03) e denúncias de usuários. Nenhum anúncio vai a público sem aprovação (RN14).

- **M11 - Notificações** (P0): Módulo centralizador de todas as notificações do PECAÊ: push notifications (via Expo/FCM/APNs), e-mails transacionais (via Resend API) e notificações in-app em tempo real (via Supabase Realtime). Outros módulos chamam NotificationService para disparar notificações. Respeita preferências de canal configuradas pelo usuário (M02).
- **M12 - Analytics e Dashboard** (P2): Módulo de analytics e dashboards para vendedores e administradores. Vendedores visualizam métricas de seus anúncios (views, contatos, taxa de conversão chat/view). Admins visualizam métricas globais da plataforma (DAU, volume de anúncios, receita de assinaturas). Metrics calculadas de forma assíncrona via BullMQ para não impactar performance das queries principais.
- **M13 - Anúncios e Publicidade In-App** (P1): Módulo de monetização via publicidade in-app do PECAÊ. Suporta dois tipos de anúncios: (1) Anúncios programáticos via Google AdMob (banners e intersticiais automáticos gerenciados pelo ecossistema Google), e (2) Anúncios Diretos — desmanches que têm seus anúncios destacados nas listagens de busca (Sponsored/Patrocinado). A ativação e pagamento das campanhas diretas ocorrem fora do aplicativo (mediante contato com o suporte), e o módulo inclui painel admin para a ativação manual das campanhas pela equipe, configuração de frequência de AdMob e tracking de impressões/cliques para relatórios.
- **M_favoritos_alertas - Favoritos e Alertas de Busca** (P1): Módulo que gerencia a lista de anúncios favoritados pelo comprador e as buscas salvas com alertas. Quando um novo anúncio é publicado (após aprovação da moderação no M09), o sistema verifica todas as SavedSearches com alertActive=true e notifica compradores com filtros compatíveis via push notification e in-app.

### Pilha Tecnológica Consolidada
- **Mobile:** React Native + Expo SDK 51 + TypeScript + Expo Router
- **Backend:** Node.js + NestJS + TypeScript
- **Database:** Supabase (PostgreSQL Full-Text Search — MVP) + Prisma ORM, Supabase (PostgreSQL) + Prisma ORM
- **Auth:** CASL (NestJS) para controle de permissões baseado em Role, Supabase Auth + JWT custom + refresh token rotativo
- **Cache:** Redis via Upstash, Redis via Upstash (cache agressivo — dados raramente mudam), Redis via Upstash (cache de configuração de anúncios e frequência por usuário), Redis via Upstash (cache de resultados de busca frequentes)
- **Queue:** BullMQ, BullMQ (jobs pós-moderação: alertas, notificações, expiração), BullMQ (processamento assíncrono de fotos e notificações), BullMQ (processamento de alertas ao publicar novo anúncio), BullMQ (processamento e envio de notificações), BullMQ (recálculo de rating médio do vendedor), BullMQ (recálculo periódico de aggregates — cron a cada 6h), BullMQ (registro assíncrono de impressões e cliques — tracking de métricas)
- **Email:** Resend / SendGrid, Resend API (e-mails transacionais)
- **Push:** Expo Notifications + FCM + APNs, Expo Push Notifications (FCM + APNs), Expo Push Notifications (FCM + APNs) via BullMQ, Expo Push Notifications via BullMQ
- **Storage:** Supabase Storage (avatar do comprador), Supabase Storage (banners e imagens de anúncios diretos), Supabase Storage / AWS S3/R2 (fotos do veículo), Supabase Storage / S3/R2, Supabase Storage / S3/R2 (logo do vendedor)
- **Deploy:** Vercel (API) + Expo EAS (mobile admin), Vercel (API) + Expo EAS (mobile)
- **Search_phase2:** OpenSearch (Fase 2)
- **Realtime:** Supabase Realtime (WebSocket — PostgreSQL CDC), Supabase Realtime (notificações in-app em tempo real)
- **Mobile_admin:** React Native + Expo SDK 51 (ou Web Admin em Next.js via Expo Router)

- **Charts:** Victory Native (React Native charts) para gráficos no app
- **Aggregation:** PostgreSQL window functions + materialized views para performance
- **Ad_network:** Google Mobile Ads SDK (AdMob) para anúncios programáticos + sistema próprio para anúncios diretos (desmanches patrocinados)
- **Analytics:** Integração com M12 — as métricas de anúncios alimentam o dashboard admin

### Atores do Sistema
- Admin (acessa métricas globais da plataforma)
- Admin (cria e gerencia campanhas de anúncios diretos no painel)
- Admin (todos os poderes de Moderador + gestão de moderadores e configurações)
- Administrador (CRUD completo via painel web)
- Comprador
- Comprador (avalia vendedor)
- Comprador (busca e filtra)
- Comprador (inicia chat via anúncio)
- Comprador (leitura via busca em cascata)
- Comprador (mantém favoritos e buscas salvas)
- Comprador (visualiza anúncios nos resultados de busca e no app)
- Comprador (visualiza perfil público)
- Google AdMob (fornece anúncios programáticos automaticamente)
- M09 (dispara evento ao publicar novo anúncio)

- Moderador (aprova/rejeita anúncios via M09)
- Moderador (concede/revoga Selo Verificado)
- Moderador (revisa e aprova/rejeita anúncios e documentos)
- Módulos PECAÊ (disparam notificações via NotificationService)
- Serviço de E-mail (Resend)
- Serviço de SMS (OTP)
- Sistema (BullMQ para processamento assíncrono)
- Sistema (BullMQ processa e entrega notificações)
- Sistema (calcula SellerStats)
- Sistema (calcula histórico de atividade)
- Sistema (entrega push notifications e calcula tempo de resposta)
- Sistema (indexação e cache de resultados frequentes)
- Sistema (recalcula aggregates via BullMQ cron)
- Sistema (recalcula rating médio via BullMQ)
- Sistema (registra impressões/cliques, controla frequência, seleciona anúncios)
- Sistema (seed inicial de marcas/modelos brasileiros)
- Sistema (verifica limites de anúncios, processa webhooks)
- Sistema (verifica matches e dispara alertas via BullMQ)
- Sistema de Autenticação (Supabase Auth)
- Supabase Storage (armazenamento de fotos)
- Usuário (recebe notificações)
- Vendedor
- Vendedor (PF ou PJ)
- Vendedor (acessa métricas dos seus anúncios e perfil)

- Vendedor (recebe avaliação — leitura apenas)
- Vendedor (recebe feedback de aprovação/rejeição)
- Vendedor (responde ao interesse)
- Vendedor (seleção no formulário de cadastro de sucata)
- Vendedor/Desmanche Anunciante (tem Listing em destaque — Sponsored via liberação do administrador)
- Visitante (busca sem autenticação)
