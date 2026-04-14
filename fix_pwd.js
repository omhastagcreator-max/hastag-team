import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  await supabase.auth.admin.updateUserById('6604cb1a-96af-44a3-967c-ae7e55062add', { password: 'password123' });
  console.log('✅ Password strictly enforced to password123');
}
run();
