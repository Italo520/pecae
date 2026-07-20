const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query(`
SELECT
  castsource::regtype AS source_type,
  casttarget::regtype AS target_type,
  castfunc::regproc AS function_name
FROM pg_cast
WHERE castfunc::regproc::text LIKE 'cast_varchar%';
`, (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows);
    client.end();
});
