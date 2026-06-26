const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to fix SellerType enum');

  try {
    await client.query('BEGIN');

    await client.query(`ALTER TYPE "SellerType" RENAME VALUE 'PF' TO 'INDIVIDUAL'`);
    await client.query(`ALTER TYPE "SellerType" RENAME VALUE 'PJ' TO 'DEALERSHIP'`);
    await client.query(`ALTER TYPE "SellerType" ADD VALUE IF NOT EXISTS 'JUNKYARD'`);

    await client.query('COMMIT');
    console.log('Enum fixed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to fix enum', e);
  }

  await client.end();
}

run();
