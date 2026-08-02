'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData) {
  const supabase = await createClient()
  
  // Verify user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  const fullName = formData.get('full_name')
  const phoneNumber = formData.get('phone_number')
  const phoneVisible = formData.get('phone_visible') === 'on'
  const username = formData.get('username')?.toLowerCase();

  // Check username uniqueness
  if (username) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()
    if (existingUser && existingUser.id !== user.id) {
       return { error: 'That username is already taken. Please choose another.' }
    }
  }

  // Update the profiles table
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
      phone_visible: phoneVisible,
      username: username,
    })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update profile:", error)
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Also update the metadata on the Auth object so user_metadata stays in sync!
  await supabase.auth.updateUser({
    data: { full_name: fullName, phone_number: phoneNumber, username: username }
  })

  // Revalidate to ensure new name shows in Navbar, Dashboard, etc.
  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function updateOnboardingState(hasCompleted) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ has_completed_onboarding: hasCompleted })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update onboarding state:", error)
    return { error: 'Failed to update' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleSkillRequest({ isActive, description = null, lat = null, lng = null }) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_requesting_skill: isActive,
        skill_request_desc: isActive ? description : null,
        skill_request_lat: isActive ? lat : null,
        skill_request_lng: isActive ? lng : null
      })
      .eq('id', user.id)

    if (error) {
      console.error("Failed to update skill request:", error)
      return { error: 'Failed to update skill request' }
    }
  } catch (err) {
    console.error("Exception during skill request update:", err);
    return { error: 'An unexpected error occurred. Did you run the SQL script?' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
