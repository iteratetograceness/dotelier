import { WINDOWS } from '../draggable/control'
import { WindowCard, WindowProps } from './window'

export function AdminLogin({ position }: Pick<WindowProps, 'position'>) {
  return (
    <WindowCard
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
      id={WINDOWS.admin.id}
      position={position}
      draggable={false}
      closeable={false}
      variant={WINDOWS.admin.variant}
    >
      <h2 className='font-normal text-lg sm:text-xl sm:px-12 text-center'>
        Admin Login
      </h2>
    </WindowCard>
  )
}
