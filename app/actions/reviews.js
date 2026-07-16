'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to leave a review.' }
  }

  const provider_id = formData.get('provider_id')
  const rating = parseInt(formData.get('rating'), 10)
  const message = formData.get('message')

  if (!provider_id || isNaN(rating) || rating < 1 || rating > 5 || !message?.trim()) {
    return { error: 'Invalid review data provided.' }
  }

  if (provider_id === user.id) {
    return { error: 'You cannot review yourself.' }
  }

  // Check if user has already reviewed this provider
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('provider_id', provider_id)
    .eq('reviewer_id', user.id)
    .single()

  if (existingReview) {
    const { error } = await supabase.from('reviews').update({
      rating,
      message: message.trim(),
      created_at: new Date().toISOString()
    }).eq('id', existingReview.id)

    if (error) {
      console.error('Error updating review:', error)
      return { error: error.message }
    }
  } else {
    const { error } = await supabase.from('reviews').insert({
      provider_id,
      reviewer_id: user.id,
      rating,
      message: message.trim()
    })

    if (error) {
      console.error('Error submitting review:', error)
      return { error: error.message }
    }
  }

  revalidatePath(`/profile/${provider_id}`)
  return { success: true }
}

export async function getReviews(provider_id) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('provider_id', provider_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data
}
