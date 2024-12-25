import { WindowProps } from '../components/window'
import { WindowData } from './portals'

export const initialWindows: Record<string, WindowData> = {
  subtitle: {
    id: 'subtitle',
    position: { x: 100, y: 100 },
    zIndex: 1,
    isVisible: true,
  },
}

type WindowMetadata = Pick<
  WindowProps,
  'variant' | 'title' | 'children' | 'className'
>

export const windowMetadata: Record<string, WindowMetadata> = {
  subtitle: {
    className: 'w-[300px]',
    variant: 'secondary',
    children: <Subtitle />,
  },
}

function Subtitle() {
  return (
    <h2 className='font-normal text-lg sm:text-xl sm:px-12 text-center'>
      A PIXEL ICON GENERATOR
    </h2>
  )
}
