'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const receiver_id = formData.get('receiver_id')
  const content = formData.get('content')

  if (!content || content.trim() === '') return { error: 'Message is empty' }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id,
      content
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function markMessagesAsRead(sender_id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Mark all messages from the sender to the current user as read
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', sender_id)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function markMessageAsDelivered(message_id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Mark a specific message as delivered
  const { error } = await supabase
    .from('messages')
    .update({ is_delivered: true })
    .eq('id', message_id)
    .eq('receiver_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function markAllUnreadAsDelivered() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Mark all unread messages received by the current user as delivered
  const { data, error } = await supabase
    .from('messages')
    .update({ is_delivered: true })
    .eq('receiver_id', user.id)
    .eq('is_delivered', false)
    .select()

  console.log('markAllUnreadAsDelivered executing for:', user.email, 'Updated rows:', data?.length || 0)

  if (error) {
    console.error('markAllUnreadAsDelivered error:', error)
    return { error: error.message }
  }

  return { success: true }
}
