interface SelectionBoxProps {
  children: React.ReactNode
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ children }) => (
  <div className='relative inline-block w-fit border-[3px] border-foreground'>
    <span className='relative z-10 pl-2 pr-1'>{children}</span>
    {/* Top Left */}
    <div className='absolute -left-[5.5px] -top-[5.5px] size-2 bg-foreground' />
    {/* Top Right */}
    <div className='absolute -right-[5.5px] -top-[5.5px] size-2 bg-foreground' />
    {/* Bottom Left */}
    <div className='absolute -left-[5.5px] -bottom-[5.5px] size-2 bg-foreground' />
    {/* Bottom Right */}
    <div className='absolute -right-[5.5px] -bottom-[5.5px] size-2 bg-foreground' />

    {/* Top Middle */}
    <div className='absolute left-1/2 -top-[5.5px] size-2 bg-foreground -translate-x-1/2' />
    {/* Bottom Middle */}
    <div className='absolute left-1/2 -bottom-[5.5px] size-2 bg-foreground -translate-x-1/2' />

    {/* Left Middle */}
    <div className='absolute -left-[5.5px] top-1/2 size-2 bg-foreground -translate-y-1/2' />
    {/* Right Middle */}
    <div className='absolute -right-[5.5px] top-1/2 size-2 bg-foreground -translate-y-1/2' />
  </div>
)
