import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and Service Role Key are required in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed() {
  console.log('🌱 Starting database seed using Admin API...');

  try {
    const usersToCreate = [
      { email: 'admin@hastag.com', password: 'password123', name: 'System Admin', team: 'admin', rawRole: 'admin' },
      { email: 'sakshi@hastag.com', password: 'password123', name: 'Sakshi', team: 'marketing', rawRole: 'employee' },
      { email: 'om@hastag.com', password: 'password123', name: 'Om', team: 'web_dev', rawRole: 'employee' },
      { email: 'vellor@hastag.com', password: 'password123', name: 'Vellor Living', rawRole: 'client' },
      { email: 'oudfy@hastag.com', password: 'password123', name: 'Oudfy Perfumes', rawRole: 'client' },
      { email: 'pamya@hastag.com', password: 'password123', name: 'Pamya Jewels', rawRole: 'client' }
    ];

    const userMappings = {};

    for (const userData of usersToCreate) {
      console.log(`Creating user: ${userData.email}`);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { name: userData.name }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
            console.log(`User ${userData.email} already exists. Fetching ID...`);
            // we skip creating if it exists, but we need ID
            // Unfortunately admin API listUsers is the only way
            const { data: listData } = await supabase.auth.admin.listUsers();
            userMappings[userData.email] = listData.users.find(u => u.email === userData.email).id;
        } else {
            console.error('Error creating user:', authError);
        }
      } else {
        userMappings[userData.email] = authData.user.id;
        console.log(`Created user ${userData.email} with ID: ${authData.user.id}`);
      }

      // We explicitly override the role using service role key
      if (userMappings[userData.email]) {
         const { error: roleError } = await supabase.from('user_roles').upsert({
             user_id: userMappings[userData.email],
             role: userData.rawRole
         });
         if (roleError) console.error('Role setting error:', roleError);
         
         // Set team if employee
         if (userData.team && userData.team !== 'admin') {
             const { error: profileError } = await supabase.from('profiles').update({
                 team: userData.team
             }).eq('user_id', userMappings[userData.email]);
             if (profileError) console.error('Profile team setting error:', profileError);
         }
      }
    }

    console.log('✅ Accounts processed. Now creating explicit Database entities...');
    const sakshiId = userMappings['sakshi@hastag.com'];
    const omId = userMappings['om@hastag.com'];
    const vellorId = userMappings['vellor@hastag.com'];
    const oudfyId = userMappings['oudfy@hastag.com'];
    const pamyaId = userMappings['pamya@hastag.com'];

    // Insert Deals
    console.log(`Deploying Deals`);
    const { data: deals, error: dealError } = await supabase.from('deals').upsert([
        { id: 'd1000000-0000-0000-0000-000000000000', service_type: 'Meta Ads', deal_value: 5000, status: 'won' },
        { id: 'd2000000-0000-0000-0000-000000000000', service_type: 'Website', deal_value: 3500, status: 'won' },
        { id: 'd3000000-0000-0000-0000-000000000000', service_type: 'Combined', deal_value: 8000, status: 'won' },
    ]).select();
    if(dealError) console.log("Deal Err:", dealError);

    console.log(`Deploying Projects`);
    const { data: projects, error: projError } = await supabase.from('projects').upsert([
        { id: 'b1000000-0000-0000-0000-000000000000', name: 'Vellor Meta Expansion', deal_id: 'd1000000-0000-0000-0000-000000000000', project_type: 'ads', client_id: vellorId, project_lead_id: sakshiId },
        { id: 'b2000000-0000-0000-0000-000000000000', name: 'Oudfy Store Build', deal_id: 'd2000000-0000-0000-0000-000000000000', project_type: 'website', client_id: oudfyId, project_lead_id: omId },
        { id: 'b3000000-0000-0000-0000-000000000000', name: 'Pamya Master Campaign', deal_id: 'd3000000-0000-0000-0000-000000000000', project_type: 'combined', client_id: pamyaId, project_lead_id: sakshiId },
    ]).select();
    if(projError) console.log("Proj Err:", projError);

    console.log(`Deploying Project Tasks`);
    const { error: taskError } = await supabase.from('project_tasks').upsert([
        { id: 'c1000000-0000-0000-0000-000000000000', project_id: 'b3000000-0000-0000-0000-000000000000', assigned_to: omId, assigned_by: sakshiId, title: 'Inject reviews onto the staging site', task_type: 'dev', category: 'Dev', status: 'ongoing' }
    ]);
    if(taskError) console.log("Task Err:", taskError);

    console.log('✅ Seed Complete!');
  } catch (err) {
    console.error('Fatal Error during seed:', err);
  }
}

seed();
