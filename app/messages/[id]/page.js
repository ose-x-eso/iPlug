import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';

export default async function MessagesPage(props) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: otherUser, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  let chatUser = otherUser;
  if (userError || !otherUser) {
    chatUser = { id: params.id, full_name: 'Unknown User' };
  }

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return (
    <ChatWindow 
      initialMessages={initialMessages || []} 
      currentUser={user} 
      otherUser={chatUser} 
    />
  );
}
