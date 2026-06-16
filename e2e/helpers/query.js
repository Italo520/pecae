const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Carregador manual e resiliente de arquivo .env (evita dependência direta do dotenv na raiz)
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let value = trimmed.substring(index + 1).trim();
          // Remove aspas
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      }
    });
  }
}

// Carregar variáveis de ambiente do banco de testes da API
const envTestPath = path.resolve(__dirname, '../../apps/api/.env.test');
loadEnvFile(envTestPath);

let dbUrl = process.env.DATABASE_URL;

// Resolver IP interno do docker no WSL para evitar falha no localhost
if (dbUrl && (dbUrl.includes('localhost:5433') || dbUrl.includes('127.0.0.1:5433'))) {
  try {
    const { execSync } = require('child_process');
    const containerIp = execSync("docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pecae-postgres-test 2>/dev/null").toString().trim();
    if (containerIp) {
      dbUrl = `postgresql://postgres:test123@${containerIp}:5432/pecae_test_db`;
      console.error(`ℹ️ [SQL BRIDGE] Redirecionando conexão para IP do container no WSL: ${dbUrl}`);
    }
  } catch (e) {
    // Silently fallback to default URL if docker is not available
  }
}

// Configurar o Prisma Client para usar a URL carregada
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  // Ler SQL da entrada padrão (stdin)
  let sql = '';
  process.stdin.setEncoding('utf-8');
  for await (const chunk of process.stdin) {
    sql += chunk;
  }

  if (!sql.trim()) {
    process.exit(0);
  }

  try {
    const result = await prisma.$queryRawUnsafe(sql);
    
    if (Array.isArray(result)) {
      result.forEach(row => {
        const values = Object.values(row).map(val => {
          if (val === null || val === undefined) return '';
          if (val instanceof Date) return val.toISOString();
          return String(val);
        });
        console.log(values.join('|'));
      });
    } else if (result !== null && result !== undefined) {
      console.log(String(result));
    }
  } catch (error) {
    console.error(`[BRIDGE SQL ERROR]: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
