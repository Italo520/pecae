const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to fix seller_type values');

  try {
    await client.query('BEGIN');

    // Update seller_profiles.seller_type
    await client.query(`UPDATE seller_profiles SET seller_type = 'INDIVIDUAL' WHERE seller_type = 'PF'`);
    await client.query(`UPDATE seller_profiles SET seller_type = 'DEALERSHIP' WHERE seller_type = 'PJ'`);

    await client.query('COMMIT');
    console.log('Values fixed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to fix values', e);
  }

  await client.end();
}

run();
