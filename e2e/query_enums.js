const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query('SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname;', (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows.map(r => r.typname));
    client.end();
});
