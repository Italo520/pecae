#!/bin/sh

# Conectando ao banco de dados configurado...
echo "Iniciando conexão com o banco de dados remoto..."

# Rodar migracoes pendentes em producao
echo "Running prisma migrate deploy..."
npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma

# Rodar seed do banco de dados (nao-critico: falha nao derruba o servidor)
echo "Running prisma db seed..."
cd apps/api && npx prisma db seed || echo "⚠️ Seed skipped (may already be seeded)" && cd ../..

# Iniciar a aplicacao
echo "Starting NestJS server..."

# Procurar o arquivo main.js se nao estiver no local esperado (comum em monorepos)
if [ -f "apps/api/dist/main.js" ]; then
    node apps/api/dist/main.js
else
    echo "🔍 main.js not found in apps/api/dist/, searching recursively..."
    FOUND_MAIN=$(find apps/api/dist -name "main.js" | head -n 1)
    if [ -n "$FOUND_MAIN" ]; then
        echo "✅ Found main.js at: $FOUND_MAIN"
        node "$FOUND_MAIN"
    else
        echo "❌ CRITICAL: main.js not found in apps/api/dist!"
        ls -R apps/api/dist
        exit 1
    fi
fi
