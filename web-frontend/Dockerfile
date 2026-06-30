# Estágio 1: builder
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências com cache de layer
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY web-frontend/package*.json ./web-frontend/
RUN npm ci --workspace=web-frontend

# Copia o código e faz build
COPY web-frontend/ ./web-frontend/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=web-frontend

# Estágio 2: runner (apenas os arquivos necessários)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone mode: copia apenas o necessário
COPY --from=builder /app/web-frontend/.next/standalone ./
COPY --from=builder /app/web-frontend/.next/static ./.next/static
COPY --from=builder /app/web-frontend/public ./public

EXPOSE 3001
CMD ["node", "server.js"]
