const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase');

  const queries = [
    `ALTER TABLE vehicle_versions ADD COLUMN IF NOT EXISTS name VARCHAR(255);`,
    `ALTER TABLE vehicle_versions ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(255);`,
    `ALTER TABLE vehicle_versions ADD COLUMN IF NOT EXISTS transmission_type VARCHAR(255);`
  ];

  for (let q of queries) {
    try {
      await client.query(q);
      console.log('Success:', q);
    } catch (e) {
      console.log('Error on', q, ':', e.message);
    }
  }

  await client.end();
}

run();
