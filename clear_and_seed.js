const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let env = {};
try {
  env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=');
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});
} catch (err) { 
  console.error('Could not read .env.local');
  process.exit(1); 
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function clearDB() {
  console.log('Fetching users to delete...');
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) { 
    console.error('Error fetching users:', error); 
    return; 
  }

  console.log(`Found ${users.users.length} users.`);
  
  for (const user of users.users) {
    if (user.email !== 'ose.eso@yahoo.com') { // Prevent deleting the dev's actual account
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error('Failed to delete user:', user.email, delError);
      } else {
        console.log('Deleted dummy user:', user.email);
      }
    }
  }
  
  console.log('Done clearing dummy users.');
  
  // Now run the seed script
  console.log('Executing seed.js...');
  require('./seed.js');
}

clearDB();
