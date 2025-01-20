'use server'

import { cookies } from 'next/headers'
import { createToken } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password')

  if (password === process.env.ADMIN_PASSWORD) {
    const token = await createToken()
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200,
    })
    redirect('/admin')
  }

  redirect('/')
}
