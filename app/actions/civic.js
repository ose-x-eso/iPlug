'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function applyForCivicAuthority() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    // For the sake of the YC demo, we will instantly approve the request.
    // In production, this would insert a row into an 'applications' table for admin review.
    const { error } = await supabase
      .from('profiles')
      .update({ is_civic_authority: true })
      .eq('id', user.id);

    if (error) {
      console.error('Error applying for civic authority:', error);
      return { error: 'Failed to submit application.' };
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error applying for civic authority:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function createCivicBroadcast(formData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    const type = formData.get('type');
    const title = formData.get('title');
    const description = formData.get('description');
    const latitude = parseFloat(formData.get('latitude'));
    const longitude = parseFloat(formData.get('longitude'));
    const radius_km = parseFloat(formData.get('radius_km'));
    const hours_to_expire = parseInt(formData.get('expiration_hours') || '24', 10);

    if (!title || !description || isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Missing required fields or location not set.' };
    }

    // Calculate expiration timestamp
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + hours_to_expire);

    const { data, error } = await supabase
      .from('civic_broadcasts')
      .insert({
        authority_id: user.id,
        type,
        title,
        description,
        latitude,
        longitude,
        radius_km,
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating civic broadcast:', error);
      return { error: 'Failed to create broadcast.' };
    }

    revalidatePath('/map');
    return { success: true, broadcast: data };
  } catch (err) {
    console.error('Unexpected error creating broadcast:', err);
    return { error: 'An unexpected error occurred.' };
  }
}
