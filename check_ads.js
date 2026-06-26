const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true' });
c.connect().then(async () => {
  const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='ad_campaigns' ORDER BY ordinal_position");
  console.log('ad_campaigns columns:', JSON.stringify(res.rows, null, 2));
  await c.end();
}).catch(e => console.error(e));
