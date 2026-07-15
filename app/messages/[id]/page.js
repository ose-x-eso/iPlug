import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ChatWindow from '@/components/chat/ChatWindow';

export default async function MessagesPage(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/'); // Must be logged in to view messages
  }

  // Fetch the person they want to chat with
  const { data: otherUser, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  let chatUser = otherUser;
  if (userError || !otherUser) {
    // If the profile is missing (e.g. old account before triggers), fallback gracefully
    chatUser = { id: params.id, full_name: 'Unknown User' };
  }

  // Fetch initial messages history between these two users
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <main className="dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 1rem 1rem 1rem' }}>
        
        {/* Render the Client Component for Realtime Chat */}
        <ChatWindow 
          initialMessages={initialMessages || []} 
          currentUser={user} 
          otherUser={chatUser} 
        />
      </main>
    </div>
  );
}
