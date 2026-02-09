const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('POSTGRES_URL_NON_POOLING is not defined in .env');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Applying migration 003_fix_rls_policies.sql...');
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/003_fix_rls_policies.sql'), 'utf8');
  await client.query(sql);
  console.log('Migration applied successfully.');
  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
