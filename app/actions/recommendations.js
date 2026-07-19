'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function createRecommendation(providerId, message, isAnonymous) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Must be logged in to recommend' };

  const { error } = await supabase.from('recommendations').insert({
    provider_id: providerId,
    recommender_id: user.id,
    message,
    is_anonymous: isAnonymous
  });

  if (error) return { error: error.message };

  const recommenderName = isAnonymous
    ? 'Someone'
    : (user.user_metadata?.username || user.email?.split('@')[0]);

  await createNotification(
    providerId,
    'recommendation',
    `${recommenderName} recommended you!`
  );

  revalidatePath(`/profile/${providerId}`);
  return { success: true };
}

export async function getRecommendations(providerId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, profiles:recommender_id(id, username, full_name, email)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function logReferral(providerId, recommenderId) {
  const supabase = await createClient();

  if (providerId === recommenderId) return { success: false };

  const { data: existing } = await supabase
    .from('recommendations')
    .select('id')
    .eq('provider_id', providerId)
    .eq('recommender_id', recommenderId)
    .single();

  if (existing) return { success: true };

  const { error } = await supabase.from('recommendations').insert({
    provider_id: providerId,
    recommender_id: recommenderId,
    message: null,
    is_anonymous: false
  });

  if (error) return { error: error.message };

  const { data: recommender } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', recommenderId)
    .single();

  const recommenderName = recommender?.full_name || recommender?.username || 'Someone';

  await createNotification(
    providerId,
    'recommendation',
    `${recommenderName} referred your profile!`
  );

  revalidatePath(`/profile/${providerId}`);
  return { success: true };
}
