'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set(name, value, options); },
        remove(name, options) { cookieStore.set(name, '', options); }
      }
    }
  );
}

export async function createNotification(userId, type, message) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    message
  });
  if (error) console.error("Error creating notification:", error);
}

export async function broadcastNotification(type, message, excludeUserId = null) {
  const supabase = await getSupabase();
  // Fetch all user profiles to notify
  const { data: profiles, error: fetchError } = await supabase.from('profiles').select('id');
  if (fetchError || !profiles) {
    console.error("Error fetching users for broadcast:", fetchError);
    return;
  }
  
  const notifications = profiles
    .filter(p => p.id !== excludeUserId)
    .map(p => ({
      user_id: p.id,
      type,
      message
    }));
    
  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) console.error("Error broadcasting notification:", error);
  }
}

export async function getNotifications() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
    
  return data || [];
}

export async function markNotificationsAsRead() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
    
  revalidatePath('/', 'layout');
}
