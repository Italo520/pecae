process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Tenta pegar a URL do BD. 
// A nova API Java roda localmente o postgres na porta 5432, banco pecae, user postgres, senha postgres
let dbUrl = process.env.DATABASE_URL || 'postgres://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0';

// No WSL ou docker, se precisar redirecionar o IP:
if (dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
  try {
    const { execSync } = require('child_process');
    const containerIp = execSync("docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pecae-postgres 2>/dev/null").toString().trim();
    if (containerIp) {
      dbUrl = `postgresql://postgres:postgres@${containerIp}:5432/pecae`;
      console.error(`ℹ️ [SQL BRIDGE] Redirecionando conexão para IP do container no WSL: ${dbUrl}`);
    }
  } catch (e) {
    // Silently fallback to default URL
  }
}

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

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    
    // Suporte para múltiplos comandos separados por ponto e vírgula, opcionalmente
    const result = await client.query(sql);
    
    // pg retorna um objeto ou array de objetos se houver múltiplos statements
    const rows = Array.isArray(result) 
      ? result.flatMap(r => r.rows) 
      : result.rows;

    if (rows && rows.length > 0) {
      rows.forEach(row => {
        const values = Object.values(row).map(val => {
          if (val === null || val === undefined) return '';
          if (val instanceof Date) return val.toISOString();
          return String(val);
        });
        console.log(values.join('|'));
      });
    } else if (result.rowCount !== undefined) {
      // Caso seja um UPDATE/INSERT/DELETE, opcional logar linhas afetadas
      // console.log(`Linhas afetadas: ${result.rowCount}`);
    }
  } catch (error) {
    console.error(`[BRIDGE SQL ERROR]: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
