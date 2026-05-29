import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const sql = readFileSync(new URL(process.argv[2], import.meta.url), 'utf8');
const client = new Client({
  connectionString: process.argv[3],
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
console.log('Migration applied successfully');
await client.end();
