const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query("SELECT id, title, status FROM listings ORDER BY created_at DESC LIMIT 5;", (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows);
    client.end();
});
