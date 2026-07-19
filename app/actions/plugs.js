'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { broadcastNotification } from './notifications'

export async function createPlug(formData) {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create a listing.' }
  }

  const title = formData.get('title')
  const description = formData.get('description')
  const pillar = formData.get('pillar')
  const category = formData.get('category')
  const address = formData.get('address') // Fallback/primary address
  const portfolio_url = formData.get('portfolio_url')
  
  let locations = [];
  const locationsStr = formData.get('locations');
  if (locationsStr) {
    try {
      locations = JSON.parse(locationsStr);
    } catch (e) {
      console.error('Error parsing locations:', e);
    }
  }
  
  let imageUrl = formData.get('icon') // fallback MVP emoji

  // Handle new native file upload
  const imageFile = formData.get('image_file');
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plugs')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { error: 'Failed to upload image. Please try again.' };
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from('plugs').getPublicUrl(fileName);
    imageUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('plugs')
    .insert({
      provider_id: user.id,
      title,
      description,
      pillar,
      category,
      address,
      locations,
      image_url: imageUrl, 
      portfolio_url: portfolio_url || null,
    })
    .select()

  if (error) {
    console.error('Error creating plug:', error)
    return { error: error.message }
  }

  // Check if user is premium
  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
  if (profile?.is_premium) {
    await broadcastNotification(
      'New Premium Plug',
      `A premium provider just listed: ${title}. Check it out!`,
      user.id
    );
  }

  // Refresh the feed
  revalidatePath('/', 'layout')
  return { success: true, data }
}

export async function deletePlug(plugId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('plugs')
    .delete()
    .eq('id', plugId)
    .eq('provider_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePlug(plugId, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  let updateData = {
    title: formData.get('title'),
    description: formData.get('description'),
    pillar: formData.get('pillar'),
    category: formData.get('category'),
    address: formData.get('address'),
  };

  const locationsStr = formData.get('locations');
  if (locationsStr) {
    try {
      updateData.locations = JSON.parse(locationsStr);
    } catch (e) {
      console.error('Error parsing locations:', e);
    }
  }

  const imageFile = formData.get('image_file');
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plugs')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { error: 'Failed to upload new image.' };
    }
    
    const { data: publicUrlData } = supabase.storage.from('plugs').getPublicUrl(fileName);
    updateData.image_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from('plugs')
    .update(updateData)
    .eq('id', plugId)
    .eq('provider_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
