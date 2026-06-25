# PECAÊ Frontend (Mobile & Web)

Este é o repositório da aplicação Client-side do PECAÊ. Desenvolvido para funcionar com excelência em ecossistemas Mobile (iOS e Android) via compilação nativa, e também com suporte transpilado para Web.

---

## 1. Visão Geral

O aplicativo atende a três frentes principais de usuários: Compradores, Vendedores e Moderadores. 
Sua interface visual segue as rigorosas especificações do design system **The Digital Forge**, focado em contrastes premium, **Glassmorphism**, transições suaves e responsividade cirúrgica.

---

## 2. Stack Tecnológica e UI/UX

- **Ecossistema:** React Native gerenciado através do Expo (SDK 51).
- **Roteamento:** Expo Router (File-based routing, simplificando Deep Linking e estrutura de abas).
- **Estilização e Identidade Visual:** NativeWind (Tailwind CSS 3/4 adaptado para React Native). Garantindo que os tokens de cores do _The Digital Forge_ sejam acessíveis universalmente.
- **Linguagem:** TypeScript (Com tipagem estrita contra a API via arquivos `.d.ts`).
- **Comunicação com API:** Axios com Interceptors embutidos para renovação de sessão (Refresh Token rotation) transparente.
- **Gráficos e Dashboards:** Victory Native (para renderização de alta performance nativa dos gráficos do módulo de Analytics e Ads).

---

## 3. Gerenciamento de Estado (Zustand)

Em vez de complexos Redux ou Prop-drilling excessivo, o projeto é suportado por _Stores_ atômicas do **Zustand**:

- **`auth-store`**: Controla globalmente o estado JWT (Access/Refresh) e persiste (via _Zustand Persist_ + _SecureStore_ nativo) para manter o usuário logado entre fechamentos do app.
- **`vehicle-wizard-store`**: Responsável pela complexa jornada de 4 passos de cadastro de sucatas, segurando o estado em memória local e só submetendo para a API no término, garantindo zero transações quebradas no banco.
- **`search-store`**: Retém as seleções de cascata na busca (Marca -> Modelo -> Versão -> Ano) mantendo a agilidade da UI independente da latência de rede.

---

## 4. Estrutura de Diretórios

Seguindo o padrão do Expo Router e clean code frontend:

```text
frontend/
├── app/                  # Rotas da aplicação (Expo Router - File-based)
│   ├── (tabs)/           # Sistema de Navegação Inferior Principal
│   ├── (auth)/           # Telas Deslogadas (Login, Register, Forgot Password)
│   └── _layout.tsx       # Root Layout (Providers e Inicialização)
├── src/
│   ├── __tests__/        # Testes unitários (Jest/Testing Library)
│   ├── components/       # Componentes Visuais (Glassmorphism, Botões, Modais)
│   ├── context/          # React Contexts auxiliares
│   ├── hooks/            # Custom Hooks (UseDebounce, UsePushNotifications)
│   ├── lib/              # Inicializadores de bibliotecas externas
│   ├── services/         # Clientes Axios e comunicação HTTP com a API Java
│   ├── store/            # Lógica Global (Zustand Stores)
│   ├── theme/            # Tokens do "The Digital Forge" e Tailwind config
│   └── utils/            # Funções utilitárias e formatadores
├── assets/               # Imagens estáticas e Fontes locais
└── metro.config.js       # Bundler configurado para aceitar monorepo symlinks
```

---

## 5. Como Executar (Setup Local)

**Pré-requisitos:**
- Node.js 20+ e NPM 10+ instalados.
- Ter rodado `npm install` na **raiz** do monorepo (isso dispara o `patch-metro.js` que conserta imports de bibliotecas vizinhas).

**Variáveis de Ambiente:**
Crie ou altere o arquivo `.env` nesta pasta de frontend com a URL que seu emulador ou celular precisa para achar a API local:
```env
# Caso esteja rodando Web local:
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1

# Caso utilize um aparelho na mesma rede wi-fi (Expo Go):
EXPO_PUBLIC_API_URL=http://192.168.1.X:8080/api/v1
```

**Passos para Execução:**
```bash
# Entrar no diretório do Frontend
cd frontend

# Iniciar o servidor Metro do Expo
npx expo start -c
```
Pressione `w` para Web, `i` para iOS Simulator ou escaneie o QRCode com o App **Expo Go** em seu smartphone.

---

## 6. Padrões de Segurança

- O aplicativo nunca envia IDs estáticos confidenciais onde não precisa.
- Se o backend Java retornar um `401 Unauthorized` por expiração total da sessão (mesmo após a tentativa de refresh), os interceptores limpam automaticamente o _SecureStore_ e forçam o Router a ejetar o usuário para a tela `/(auth)/login`, bloqueando telas de "Loading" fantasmas.

---
**PECAÊ Development Team**
