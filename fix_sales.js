import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log('Registering sales@hastag.com...');
  
  // 1. Manually create the user safely
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'sales@hastag.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Sales Team' }
  });
  
  let salesUser = authData?.user;
  
  if (authError && authError.message.includes('already been registered')) {
     console.log('User already exists, attempting to fetch ID from profiles table...');
     let { data: profile } = await supabase.from('profiles').select('user_id').ilike('email', 'sales@hastag.com').single();
     if(profile) { salesUser = { id: profile.user_id }; }
  } else if (authError) {
     console.error('Error:', authError.message);
     return;
  }
  
  if (!salesUser || !salesUser.id) {
    console.error('Could not locate sales user in the DB!', salesUser);
    return;
  }

  console.log('Applying Sales policies to ID:', salesUser.id);
  
  // 3. Force Insert Role and Profiles
  await supabase.from('profiles').upsert({ user_id: salesUser.id, role: 'sales', full_name: 'Sales Team', email: 'sales@hastag.com' });
  await supabase.from('user_roles').upsert({ user_id: salesUser.id, role: 'sales' });
  
  console.log('✅ successfully registered and configured sales@hastag.com !');
}

run();
