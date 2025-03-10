'use server'

import { createClient } from '@/app/db/supabase/server'
import { createToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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

const ResponseSchema = z.object({
  job_id: z.string(),
  status: z.string(),
})

export async function startInference(prompt: string) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const jwt = session?.access_token

  if (!jwt) {
    return { error: 'Unauthorized' }
  }

  const response = await fetch(
    process.env.NODE_ENV === 'production'
      ? 'https://iteratetograceness--pixel-api.modal.run/v1/pixel'
      : 'https://iteratetograceness--pixel-api-dev.modal.run/v1/pixel',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Supabase-Auth': jwt,
      },
      body: JSON.stringify({
        input: {
          prompt,
          style: 'color_v2',
        },
      }),
    }
  )

  const data = await response.json()

  const parsedData = ResponseSchema.safeParse(data)

  if (!parsedData.success) {
    return { error: 'Invalid response' }
  }

  return { jobId: parsedData.data.job_id }
}
