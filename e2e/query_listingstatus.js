const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require' });
client.connect();
client.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ListingStatus') ORDER BY enumsortorder;", (err, res) => {
    if (err) console.error(err);
    else console.log(res.rows.map(r => r.enumlabel));
    client.end();
});
