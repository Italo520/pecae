const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to convert ALL ID texts to uuid');

  try {
    await client.query('BEGIN');
    
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

    for (let fk of fks.rows) {
      await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT "${fk.constraint_name}"`);
    }

    const cols = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type IN ('character varying', 'text')
        AND (column_name = 'id' OR column_name LIKE '%_id' OR column_name = 'duplicate_of_id' OR column_name = 'A' OR column_name = 'B')
    `);

    for (let col of cols.rows) {
      if (col.table_name === '_prisma_migrations') continue;
      // skip ones that don't look like UUIDs, but we'll try/catch
      try {
        console.log(`Casting ${col.table_name}.${col.column_name} to UUID`);
        await client.query(`ALTER TABLE "${col.table_name}" ALTER COLUMN "${col.column_name}" TYPE uuid USING "${col.column_name}"::uuid`);
      } catch (err) {
        console.log(`Skipping ${col.table_name}.${col.column_name}: ${err.message}`);
      }
    }

    for (let fk of fks.rows) {
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
    console.log('Successfully migrated to UUID');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed, rolled back', e);
  }

  await client.end();
}

run();
