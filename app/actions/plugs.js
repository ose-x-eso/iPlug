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
  const address = formData.get('address')
  const icon = formData.get('icon') // Using emoji as MVP image
  const portfolio_url = formData.get('portfolio_url')

  const { data, error } = await supabase
    .from('plugs')
    .insert({
      provider_id: user.id,
      title,
      description,
      pillar,
      category,
      address,
      image_url: icon, // Repurposing image_url for the emoji
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

export async function updatePlug(plugId, updateData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('plugs')
    .update(updateData)
    .eq('id', plugId)
    .eq('provider_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
