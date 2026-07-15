'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  
  const emailOrUsername = formData.get('email')
  const password = formData.get('password')

  let loginEmail = emailOrUsername;

  // If it's not an email, assume it's a username and look up the email
  if (!emailOrUsername.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', emailOrUsername)
      .single();
      
    if (!profile || !profile.email) {
      return { error: 'Username not found.' }
    }
    loginEmail = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
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
  const username = formData.get('username')

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { error: 'That username is already taken. Please choose another.' }
  }

  // 1. Sign up the user and pass metadata for the trigger
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        username: username,
      }
    }
  })

  if (error) {
    return { error: error.message || 'An unknown error occurred during sign up.' }
  }

  // Ensure the username is written to the profile (in case the trigger didn't catch it)
  if (data?.user) {
    await supabase.from('profiles').update({ username }).eq('id', data.user.id);
  }

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
