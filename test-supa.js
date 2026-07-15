const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://rkmpegyazjazhlyltuzh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbXBlZ3lhemphemhseWx0dXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNjAzMzgsImV4cCI6MjA5OTYzNjMzOH0.H5j_Log6R75FLXVRxJy7o-8B6hokZ28AdGElavgO-Sw');

async function test() {
  const userId = '11111111-1111-1111-1111-111111111111';
  const chatUserId = '22222222-2222-2222-2222-222222222222';
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${chatUserId}),and(sender_id.eq.${chatUserId},receiver_id.eq.${userId})`);
    
  console.log('Error:', error);
  console.log('Data length:', data?.length);
}

test();
