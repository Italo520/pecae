const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query("SELECT id, title, status FROM listings WHERE title LIKE 'Moderação E2E%';", (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows);
    client.end();
});
