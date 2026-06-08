# Stage 1: Pruning
# Usando node:22-slim (Debian) para evitar bug do OpenSSL GCM no Alpine
FROM node:22-slim AS pruner
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install -g turbo@2.0.0
# Cache breaker
# Timestamp: 2026-06-03T16:19
COPY . .
RUN turbo prune @pecae/mobile --docker

# Stage 2: Dependencies
FROM node:22-slim AS installer
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
COPY scripts/ ./scripts/
# Forçar NODE_ENV para instalar devDependencies necessárias para o build
ENV NODE_ENV=development
RUN npm install --legacy-peer-deps

# Stage 3: Build — A variavel EXPO_PUBLIC_API_URL DEVE ser passada como ARG para ser embutida no bundle
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .

# ARG de build-time: injeta a URL da API dentro do bundle JavaScript
ARG EXPO_PUBLIC_API_URL=https://api-pecae.italohub.cloud/api/v1
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# ARGs do Supabase: necessários para o Realtime/WebSocket funcionar em produção (wss://)
ARG EXPO_PUBLIC_SUPABASE_URL=https://hsxeulvcfrbyvxehhhaj.supabase.co
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL

ARG EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeGV1bHZjZnJieXZ4ZWhoaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTU0NjQsImV4cCI6MjA5NjQ3MTQ2NH0.gl7nMqpNt-5-AQb39OogZUsTTzcoqtr0esoumTUu6c0
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY

RUN npx turbo@2.0.0 run build --filter=@pecae/mobile --force

# Stage 4: Runner (Nginx com proxy reverso para a API)
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/apps/mobile/dist .
COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
