const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: 'postgres://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0',
});

async function run() {
  await client.connect();
  const res = await client.query(`
      INSERT INTO saved_searches (id, user_id, query, filters, alert_active, created_at, updated_at)
      VALUES ('9d568150-1ea0-43b3-ae23-a022f8597aee', '1d2bb0da-c4fe-4fdf-8e18-1c61ac52b837', 'Gol', '{"brandId":"82fabfc4-e217-4daa-a232-0420f19444d7","modelId":"ba0e128c-f5eb-4199-9064-aa9688e4e338"}', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
  `);
  console.log(res);
  await client.end();
}

run().catch(console.error);
