'use client'

import { useState, useTransition } from 'react'
import { AlertDialog } from 'radix-ui'
import { Button } from '@/app/_components/button'
import { deletePixelAction } from './delete'
import { toast } from 'sonner'
import { getError } from '@/lib/error'
import type { ErrorCode } from '@/lib/error'

export function DeletePixelButton({
  pixelId,
  children,
}: {
  pixelId: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePixelAction(pixelId)
      if (result?.error) {
        toast.error(getError(result.error as ErrorCode))
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='fixed inset-0 bg-black/40 z-50' />
        <AlertDialog.Content className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background pixel-corners pixel-border-foreground p-6 z-50 w-80 flex flex-col gap-4'>
          <AlertDialog.Title className='text-lg text-foreground'>
            Delete pixel?
          </AlertDialog.Title>
          <AlertDialog.Description className='text-sm text-shadow'>
            This action cannot be undone. The pixel and all its versions will be
            permanently deleted.
          </AlertDialog.Description>
          <div className='flex gap-2 justify-end'>
            <AlertDialog.Cancel asChild>
              <Button variant='primary' disabled={isPending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant='dark'
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
