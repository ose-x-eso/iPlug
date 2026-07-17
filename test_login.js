const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ifeanyichukwudanielndubuisi@gmail.com',
    password: 'ndubuisi1234'
  });
  console.log('Login result:', error || 'Success');
}
test();
