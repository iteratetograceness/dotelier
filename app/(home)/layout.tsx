export default function StudioLayout({ canvas }: { canvas: React.ReactNode }) {
  return (
    <div className='flex-1 flex justify-center items-center py-7'>
      {canvas}
    </div>
  )
}
