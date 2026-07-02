const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query(`
DROP CAST IF EXISTS (character varying AS "ListingStatus");
DROP FUNCTION IF EXISTS cast_varchar_to_listingstatus;
`, (err, res) => {
    if (err) console.error(err);
    else console.log('Dropped successfully');
    client.end();
});
