'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { dispatchExternalNotifications } from '@/lib/notifications/dispatch';

const HIGH_PRIORITY_TYPES = new Set(['NEW_MESSAGE', 'UNREAD_REMINDER', 'Unread Messages']);

export async function createNotification(userId, type, message, options = {}) {
  const { link = null } = options;
  const supabase = await createClient();

  const insertData = { user_id: userId, type, message };
  if (link) insertData.link = link;

  const { error } = await supabase.from('notifications').insert(insertData);
  if (error) {
    console.error('Error creating notification:', error);
    return { error: error.message };
  }

  if (HIGH_PRIORITY_TYPES.has(type)) {
    dispatchExternalNotifications(userId, { type, message, link }).catch((err) => {
      console.error('External notification dispatch failed:', err);
    });
  }

  return { success: true };
}

export async function broadcastNotification(type, message, excludeUserId = null) {
  const supabase = await createClient();
  const { data: profiles, error: fetchError } = await supabase.from('profiles').select('id');
  if (fetchError || !profiles) {
    console.error('Error fetching users for broadcast:', fetchError);
    return;
  }

  const notifications = profiles
    .filter((p) => p.id !== excludeUserId)
    .map((p) => ({
      user_id: p.id,
      type,
      message,
    }));

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) console.error('Error broadcasting notification:', error);
  }
}

export async function getNotifications() {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  revalidatePath('/', 'layout');
}

export async function markNotificationAsRead(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/', 'layout');
}

export async function updateNotificationPreferences(preferences) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updateData = {};
  if (typeof preferences.whatsapp_notifications_enabled === 'boolean') {
    updateData.whatsapp_notifications_enabled = preferences.whatsapp_notifications_enabled;
  }
  if (typeof preferences.push_notifications_enabled === 'boolean') {
    updateData.push_notifications_enabled = preferences.push_notifications_enabled;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating notification preferences:', error);
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}
