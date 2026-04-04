import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.piszlmybngkliypiietv:9450213277Om%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function main() {
  await client.connect();

  console.log('Cleaning up duplicate roles for clients...');
  try {
      await client.query(`
        DELETE FROM public.user_roles 
        WHERE role = 'employee' 
        AND user_id IN (
            SELECT user_id FROM public.user_roles WHERE role = 'client'
        );
      `);
      console.log('✅ Duplicate client roles deleted.');
  } catch(err) {
     console.error('❌ Role cleanup error:', err.message);
  }

  await client.end();
}

main().catch(console.error);
