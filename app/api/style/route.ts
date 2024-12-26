import { apiKey } from '@/lib/provider'
import { apiUrlStyle } from '@/lib/provider'
import { after, NextRequest, NextResponse } from 'next/server'
import { updateEdgeConfig } from './update-ec'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ styleId: string } | { error: string }>> {
  const token = request.cookies.get('token')?.value

  if (!token || !(await verifyToken(token))) {
    console.error('Unauthorized request to create style')
    redirect('/')
  }

  const formData = await request.formData()
  const files = formData.getAll('files')

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  if (!files.every((file) => file instanceof File)) {
    return NextResponse.json({ error: 'Invalid files' }, { status: 400 })
  }

  const apiFormData = new FormData()
  apiFormData.append('style', 'icon')

  for (const file of files) {
    apiFormData.append('file', file)
  }

  const response = await fetch(apiUrlStyle, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: apiFormData,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(text)
    return NextResponse.json(
      { error: 'Failed to create style' },
      { status: 500 }
    )
  }

  const data = await response.json()

  const isValid = invariantCheck(data)

  if (!isValid) {
    console.error('Failed invariant check: ', data)
    return NextResponse.json(
      { error: 'Failed to create style' },
      { status: 500 }
    )
  }

  after(async () => {
    await updateEdgeConfig(data.id, files)
  })

  console.log('New style ID: ', data.id)

  return NextResponse.json({ styleId: data.id })
}

function invariantCheck(data: unknown): data is { id: string } {
  if (!data || typeof data !== 'object' || !('id' in data)) {
    return false
  }

  return true
}
