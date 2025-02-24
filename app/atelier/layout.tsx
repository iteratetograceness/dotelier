export default function ExploreLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className='w-screen relative'>
      {children}
      {modal}
    </div>
  )
}
