'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function sendMessage(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const receiver_id = formData.get('receiver_id')
  const content = formData.get('content')
  const file_url = formData.get('file_url')
  const file_name = formData.get('file_name')
  const file_type = formData.get('file_type')
  const voice_note_url = formData.get('voice_note_url')

  if ((!content || content.trim() === '') && !file_url && !voice_note_url) {
    return { error: 'Message is empty' }
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id,
      content: content || '',
      file_url,
      file_name,
      file_type,
      voice_note_url
    })

  if (error) {
    return { error: error.message }
  }

  if (receiver_id && receiver_id !== user.id) {
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single()

    const senderName = senderProfile?.username || senderProfile?.full_name || 'Someone'
    let preview = content.trim()
    if (!preview) {
      if (voice_note_url) preview = 'Sent a voice note 🎤'
      else if (file_url) preview = file_type === 'image' ? 'Sent a photo 📷' : 'Sent an attachment 📎'
      else preview = 'Sent a message'
    }
    const truncated = preview.length > 80 ? `${preview.substring(0, 80)}...` : preview

    await createNotification(
      receiver_id,
      'NEW_MESSAGE',
      `${senderName}: ${truncated}`,
      { link: `/messages/${user.id}` }
    )
  }

  revalidatePath('/messages', 'layout')
  return { success: true }
}

export async function markMessagesAsRead(sender_id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

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

  const { data, error } = await supabase
    .from('messages')
    .update({ is_delivered: true })
    .eq('receiver_id', user.id)
    .eq('is_delivered', false)
    .select()

  if (error) {
    console.error('markAllUnreadAsDelivered error:', error)
    return { error: error.message }
  }

  return { success: true, updated: data?.length || 0 }
}
