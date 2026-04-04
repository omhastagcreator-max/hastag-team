import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.piszlmybngkliypiietv:9450213277Om%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function main() {
  await client.connect();

  console.log('Finding all test users...');
  try {
     const { rows } = await client.query(`SELECT id, email FROM auth.users WHERE email LIKE '%@hastag.com';`);
     console.log('Found users:', rows);
     
     if (rows.length > 0) {
         console.log('Deleting test users to start fresh...');
         const emails = rows.map(r => `'${r.email}'`).join(',');
         await client.query(`DELETE FROM auth.users WHERE email IN (${emails});`);
         console.log('✅ Users deleted.');
     }
  } catch(err) {
     console.error('❌ Error finding/deleting users:', err.message);
  }

  await client.end();
}

main().catch(console.error);
