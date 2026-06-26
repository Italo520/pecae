const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to fix schema mismatches part 2');

  try {
    await client.query('BEGIN');

    // Fix seller_stats
    await client.query('ALTER TABLE seller_stats RENAME COLUMN rating TO rating_avg;');

    // Fix seller_verifications
    await client.query('ALTER TABLE seller_verifications RENAME COLUMN created_at TO requested_at;');
    await client.query('ALTER TABLE seller_verifications RENAME COLUMN notes TO rejection_reason;');

    await client.query('COMMIT');
    console.log('Schema fixed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to fix schema', e);
  }

  await client.end();
}

run();
