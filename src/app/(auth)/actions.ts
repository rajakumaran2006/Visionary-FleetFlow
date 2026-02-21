'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard') // Or wherever you route authenticated users
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: formData.get('role') as string,
        full_name: formData.get('full_name') as string,
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Insert user into public.users table immediately after signup
  if (signUpData.user) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        full_name: signUpData.user.user_metadata?.full_name,
        role: signUpData.user.user_metadata?.role,
      })

    if (insertError) {
      console.error('Error inserting user to public.users:', insertError)
    }
  }

  redirect('/login?message=' + encodeURIComponent('A verification link has been sent to your email. Please check your inbox and verify your email before signing in.'))
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    return redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/forgot-password?message=' + encodeURIComponent('A password reset link has been sent to your email. Please check your inbox.'))
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    return redirect('/update-password?error=' + encodeURIComponent(error.message))
  }

  await supabase.auth.signOut()

  redirect('/login?message=Password updated successfully')
}
