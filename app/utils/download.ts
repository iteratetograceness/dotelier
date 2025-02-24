import { toast } from 'sonner'

export async function downloadIcon({
  src,
  prompt,
}: {
  src: string
  prompt: string
}) {
  try {
    const fileName = prompt.replace(/ /g, '-') || 'dotelier-icon.png'

    const blob = await fetch(src).then((res) => res.blob())
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('[downloadIcon]: ', error)
    toast.error('Failed to download icon. Please try again.')
  }
}
