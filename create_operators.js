const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to create operators');

  try {
    await client.query('BEGIN');
    
    // uuid = varchar
    await client.query(`
      CREATE OR REPLACE FUNCTION uuid_eq_varchar(uuid, character varying) RETURNS boolean AS $$
      SELECT $1 = $2::uuid;
      $$ LANGUAGE SQL IMMUTABLE;
    `);

    try {
      await client.query(`
        CREATE OPERATOR = (
          LEFTARG = uuid,
          RIGHTARG = character varying,
          PROCEDURE = uuid_eq_varchar,
          COMMUTATOR = =,
          RESTRICT = eqsel,
          JOIN = eqjoinsel
        );
      `);
      console.log("Created = for uuid, varchar");
    } catch (e) {
      console.log("Operator already exists? " + e.message);
    }

    // varchar = uuid
    await client.query(`
      CREATE OR REPLACE FUNCTION varchar_eq_uuid(character varying, uuid) RETURNS boolean AS $$
      SELECT $1::uuid = $2;
      $$ LANGUAGE SQL IMMUTABLE;
    `);

    try {
      await client.query(`
        CREATE OPERATOR = (
          LEFTARG = character varying,
          RIGHTARG = uuid,
          PROCEDURE = varchar_eq_uuid,
          COMMUTATOR = =,
          RESTRICT = eqsel,
          JOIN = eqjoinsel
        );
      `);
      console.log("Created = for varchar, uuid");
    } catch (e) {
      console.log("Operator already exists? " + e.message);
    }
    
    // uuid != varchar
    await client.query(`
      CREATE OR REPLACE FUNCTION uuid_neq_varchar(uuid, character varying) RETURNS boolean AS $$
      SELECT $1 <> $2::uuid;
      $$ LANGUAGE SQL IMMUTABLE;
    `);

    try {
      await client.query(`
        CREATE OPERATOR <> (
          LEFTARG = uuid,
          RIGHTARG = character varying,
          PROCEDURE = uuid_neq_varchar,
          COMMUTATOR = <>,
          RESTRICT = neqsel,
          JOIN = neqjoinsel
        );
      `);
      console.log("Created <> for uuid, varchar");
    } catch (e) {
      console.log("Operator already exists? " + e.message);
    }
    
    // varchar != uuid
    await client.query(`
      CREATE OR REPLACE FUNCTION varchar_neq_uuid(character varying, uuid) RETURNS boolean AS $$
      SELECT $1::uuid <> $2;
      $$ LANGUAGE SQL IMMUTABLE;
    `);

    try {
      await client.query(`
        CREATE OPERATOR <> (
          LEFTARG = character varying,
          RIGHTARG = uuid,
          PROCEDURE = varchar_neq_uuid,
          COMMUTATOR = <>,
          RESTRICT = neqsel,
          JOIN = neqjoinsel
        );
      `);
      console.log("Created <> for varchar, uuid");
    } catch (e) {
      console.log("Operator already exists? " + e.message);
    }

    await client.query('COMMIT');
    console.log('Successfully created operators!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed, rolled back', e);
  }

  await client.end();
}

run();
