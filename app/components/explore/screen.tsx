export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='border border-foreground w-full h-auto aspect-video m-10'
      style={{
        backgroundImage: 'url("/windowxp.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  )
}
