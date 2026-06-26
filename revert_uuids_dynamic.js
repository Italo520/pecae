const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to convert ALL uuids to text');

  try {
    await client.query('BEGIN');
    
    // 1. Get all foreign keys
    const fks = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `);

    console.log(`Found ${fks.rows.length} foreign keys to drop and recreate.`);

    // 2. Drop all foreign keys
    for (let fk of fks.rows) {
      await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"`);
    }

    // 3. Alter all ID columns that are currently uuid
    const cols = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type = 'uuid'
    `);

    for (let col of cols.rows) {
      if (col.table_name === '_prisma_migrations') continue;
      // Skip auth schemas if any (though we are filtering by public schema)
      console.log(`Casting ${col.table_name}.${col.column_name} to TEXT`);
      await client.query(`ALTER TABLE "${col.table_name}" ALTER COLUMN "${col.column_name}" TYPE text USING "${col.column_name}"::text`);
    }

    // 4. Alter all columns that end with _id and are currently uuid
    const colsId = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name LIKE '%_id'
        AND data_type = 'uuid'
    `);

    for (let col of colsId.rows) {
      if (col.table_name === '_prisma_migrations') continue;
      console.log(`Casting ${col.table_name}.${col.column_name} to TEXT`);
      await client.query(`ALTER TABLE "${col.table_name}" ALTER COLUMN "${col.column_name}" TYPE text USING "${col.column_name}"::text`);
    }

    // 5. Re-add foreign keys
    for (let fk of fks.rows) {
      console.log(`Re-adding FK: ${fk.constraint_name} on ${fk.table_name}`);
      let query = `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}")`;
      if (fk.delete_rule && fk.delete_rule !== 'NO ACTION') query += ` ON DELETE ${fk.delete_rule}`;
      if (fk.update_rule && fk.update_rule !== 'NO ACTION') query += ` ON UPDATE ${fk.update_rule}`;
      try {
          await client.query(query);
      } catch (err) {
          console.error(`Failed to re-add FK ${fk.constraint_name}: ${err.message}`);
      }
    }

    await client.query('COMMIT');
    console.log('Successfully migrated all UUIDs to TEXT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed, rolled back', e);
  }

  await client.end();
}

run();
