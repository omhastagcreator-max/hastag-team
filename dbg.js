import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.piszlmybngkliypiietv:9450213277Om%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function main() {
  console.log('Connecting to Supabase using IPv4 Pooler...');
  await client.connect();
  console.log('✅ Connected to Database successfully!');

  console.log('Dropping the corrupted trigger...');
  try {
      await client.query(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`);
      console.log('✅ Trigger DROPPED directly from database.');
  } catch(err) {
     console.error('❌ Trigger drop error:', err.message);
  }

  // To be safe, test an isolated auth user query
  try {
     const { rows } = await client.query(`SELECT count(*) FROM auth.users`);
     console.log(`✅ System check: ${rows[0].count} users currently in auth.users`);
  } catch(err) {
     console.error('❌ Auth select error:', err.message);
  }

  await client.end();
}

main().catch(console.error);
