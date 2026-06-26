const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function run() {
  await c.connect();
  
  // Ver dados existentes nas tabelas de ads
  const campaigns = await c.query("SELECT id, status, nome FROM ad_campaigns LIMIT 5");
  console.log('ad_campaigns data:', JSON.stringify(campaigns.rows, null, 2));
  
  const creatives = await c.query("SELECT id, campaign_id, placement, ativo FROM ad_creatives LIMIT 5");
  console.log('ad_creatives data:', JSON.stringify(creatives.rows, null, 2));
  
  // Tentar a query que o Hibernate roda
  try {
    const testQuery = await c.query(`
      SELECT c.id, c.placement, c.ativo, cam.status, cam.data_inicio, cam.data_fim
      FROM ad_creatives c
      JOIN ad_campaigns cam ON cam.id = c.campaign_id
      WHERE c.placement = 'HOME_TOP'
        AND c.ativo = true
        AND cam.status = 'ATIVA'
      LIMIT 1
    `);
    console.log('Query result:', testQuery.rows);
  } catch (e) {
    console.error('Query error:', e.message);
  }
  
  await c.end();
}
run().catch(e => console.error(e));
