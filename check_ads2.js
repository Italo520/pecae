const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function run() {
  await c.connect();
  console.log('Conectado - verificando ad_campaigns e ad_creatives');

  // Verificar ad_creatives
  const creativesCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='ad_creatives' ORDER BY ordinal_position");
  console.log('ad_creatives colunas:', creativesCols.rows.map(r => r.column_name + ' (' + r.data_type + ')'));

  // Verificar advertisers
  const advCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='advertisers' ORDER BY ordinal_position");
  console.log('advertisers colunas:', advCols.rows.map(r => r.column_name + ' (' + r.data_type + ')'));

  await c.end();
}
run().catch(e => console.error(e));
