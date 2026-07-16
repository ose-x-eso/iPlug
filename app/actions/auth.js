'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createNotification } from './notifications'

export async function login(formData) {
  const supabase = await createClient()
  
  const emailOrUsername = formData.get('email')?.toLowerCase();
  const password = formData.get('password');

  let loginEmail = emailOrUsername;

  // If it's not an email, assume it's a username and look up the email
  if (!emailOrUsername.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', emailOrUsername)
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
  try {
    const supabase = await createClient()
    
    const email = formData.get('email')?.toLowerCase();
    const password = formData.get('password')
    const fullName = formData.get('fullName')
    const phoneNumber = formData.get('phoneNumber')
    const username = formData.get('username')?.toLowerCase();

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

    // Ensure the username and email are written to the profile (in case the trigger didn't catch it)
    if (data?.user) {
      await supabase.from('profiles').update({ username, email }).eq('id', data.user.id);
      
      // Send Welcome Notification
      await createNotification(
        data.user.id,
        'Welcome',
        'Welcome to iPlug! Start exploring services and shops around you.'
      );
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Sign up error:', err);
    return { error: err?.message || 'An unexpected error occurred during sign up.' };
  }
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

export async function sendPasswordResetEmail(formData) {
  const supabase = await createClient();
  const email = formData.get('email');

  if (!email) {
    return { error: 'Email is required' };
  }

  // The redirectTo URL must go through the callback route to exchange the code for a session cookie
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateUserPassword(formData) {
  const supabase = await createClient();
  const password = formData.get('password');

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteUserAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // To delete a user, we must call a custom PostgreSQL function 'delete_user' via RPC.
  const { error } = await supabase.rpc('delete_user');

  if (error) {
    return { error: error.message };
  }

  // Sign out the user locally after successful deletion
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  return { success: true };
}

