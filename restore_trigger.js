import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.piszlmybngkliypiietv:9450213277Om%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function main() {
  await client.connect();

  console.log('Restoring the trigger...');
  try {
      await client.query(`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
          admin_count INT;
        BEGIN
          INSERT INTO public.profiles (user_id, email, name)
          VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
          
          SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
          
          IF admin_count = 0 THEN
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
          ELSE
            INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
          END IF;
          
          RETURN NEW;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `);
      console.log('✅ Trigger restored.');
  } catch(err) {
     console.error('❌ Trigger restore error:', err.message);
  }

  await client.end();
}

main().catch(console.error);
