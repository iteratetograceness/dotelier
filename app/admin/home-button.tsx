'use client'

import { redirect } from 'next/navigation'
import { Button } from '../_components/button'

export function HomeButton() {
  return <Button onClick={() => redirect('/')}>go home</Button>
}
