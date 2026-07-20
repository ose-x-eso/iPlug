import { createClient } from '@/utils/supabase/server';
import AppShell from '@/components/layout/AppShell';
import MessagesLayoutClient from './MessagesLayoutClient';
import { redirect } from 'next/navigation';

export default async function MessagesLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Fetch all messages involving this user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Fetch all profiles so we can map names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url');

  // Group messages by conversation partner
  const conversationsMap = new Map();

  if (messages) {
    messages.forEach(msg => {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          latestMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread messages where current user is the receiver
      if (msg.receiver_id === user.id && !msg.is_read) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    });
  }

  // Convert to array and format
  const conversations = Array.from(conversationsMap.entries()).map(([otherUserId, data]) => {
    const profile = profiles?.find(p => p.id === otherUserId);
    return {
      otherUserId,
      fullName: profile?.full_name || profile?.username || 'Instagram User',
      avatarUrl: profile?.avatar_url,
      latestMessage: data.latestMessage,
      unreadCount: data.unreadCount
    };
  });

  return (
    <AppShell initialUser={user}>
      <MessagesLayoutClient user={user} conversations={conversations}>
        {children}
      </MessagesLayoutClient>
    </AppShell>
  );
}
