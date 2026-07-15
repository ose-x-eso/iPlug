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

  // Update the profiles table
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
    })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update profile:", error)
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Also update the metadata on the Auth object so user_metadata.full_name stays in sync!
  await supabase.auth.updateUser({
    data: { full_name: fullName, phone_number: phoneNumber }
  })

  // Revalidate to ensure new name shows in Navbar, Dashboard, etc.
  revalidatePath('/', 'layout')
  
  return { success: true }
}
