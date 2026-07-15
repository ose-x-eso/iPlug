'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  
  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message || 'An unknown error occurred during login.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signUp(formData) {
  const supabase = await createClient()
  
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('fullName')
  const phoneNumber = formData.get('phoneNumber')

  // 1. Sign up the user and pass metadata for the trigger
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
      }
    }
  })

  if (error) {
    return { error: error.message || 'An unknown error occurred during sign up.' }
  }

  // The database trigger will automatically create the profile for us!
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message || 'An unknown error occurred during logout.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
