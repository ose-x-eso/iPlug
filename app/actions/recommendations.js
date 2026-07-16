'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

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

export async function createRecommendation(providerId, message, isAnonymous) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Must be logged in to recommend" };

  const { error } = await supabase.from('recommendations').insert({
    provider_id: providerId,
    recommender_id: user.id,
    message,
    is_anonymous: isAnonymous
  });

  if (error) return { error: error.message };

  const recommenderName = isAnonymous 
    ? "Someone" 
    : (user.user_metadata?.username || user.email?.split('@')[0]);

  // Send a notification
  await createNotification(
    providerId, 
    'recommendation', 
    `${recommenderName} recommended you!`
  );

  revalidatePath(`/profile/${providerId}`);
  return { success: true };
}

export async function getRecommendations(providerId) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, profiles:recommender_id(id, username, full_name, email)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function logReferral(providerId, recommenderId) {
  const supabase = await getSupabase();
  
  // Don't allow self-referrals
  if (providerId === recommenderId) return { success: false };

  // Check if this referral already exists to prevent duplicates
  const { data: existing } = await supabase
    .from('recommendations')
    .select('id')
    .eq('provider_id', providerId)
    .eq('recommender_id', recommenderId)
    .single();

  if (existing) return { success: true }; // Already logged

  const { error } = await supabase.from('recommendations').insert({
    provider_id: providerId,
    recommender_id: recommenderId,
    message: null,
    is_anonymous: false
  });

  if (error) return { error: error.message };

  // Get recommender details for the notification
  const { data: recommender } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', recommenderId)
    .single();

  const recommenderName = recommender?.full_name || recommender?.username || "Someone";

  await createNotification(
    providerId, 
    'recommendation', 
    `${recommenderName} referred your profile!`
  );

  revalidatePath(`/profile/${providerId}`);
  return { success: true };
}
