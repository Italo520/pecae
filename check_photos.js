const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase');

  // Verificar quantas fotos tem URL com domínio falso
  const countRes = await client.query(`
    SELECT COUNT(*) as total FROM vehicle_photos WHERE url LIKE '%pecae-mock-storage.com%'
  `);
  console.log('Fotos com URL falsa:', countRes.rows[0].total);

  // Verificar um exemplo
  const exampleRes = await client.query(`
    SELECT id, url FROM vehicle_photos WHERE url LIKE '%pecae-mock-storage.com%' LIMIT 3
  `);
  console.log('Exemplos:', JSON.stringify(exampleRes.rows, null, 2));

  // Verificar se há fotos com URLs reais do Supabase também
  const supabaseRes = await client.query(`
    SELECT COUNT(*) as total FROM vehicle_photos WHERE url LIKE '%supabase%'
  `);
  console.log('Fotos com URL Supabase real:', supabaseRes.rows[0].total);

  await client.end();
}

run();
