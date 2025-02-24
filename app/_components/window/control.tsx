import { BaseWindowProps } from './base'
import { WindowMap } from './context'

interface PositionalData {
  windowId: string
  order: number
  anchorElementId: string
  deltaX: number
  deltaY: number
}

/**
 * Need to add:
 * - Window for showing daily credit usage
 * - Editor (not open initially)
 */

export const initialWindows: WindowMap = {
  subtitle: {
    id: 'subtitle',
    zIndex: 1,
    isVisible: true,
  },
}

export const positionalData: PositionalData[] = [
  {
    order: 0,
    windowId: 'subtitle',
    anchorElementId: 'menu',
    deltaX: -400,
    deltaY: -100,
  },
  {
    order: 1,
    windowId: 'ratelimitinfo',
    anchorElementId: 'output',
    deltaX: 350,
    deltaY: -300,
  },
]

type WindowConfig = Pick<
  BaseWindowProps,
  'variant' | 'title' | 'children' | 'className'
> & {
  closeable?: boolean
}

export const windowConfig: Record<string, WindowConfig> = {
  subtitle: {
    className: 'w-fit',
    variant: 'secondary',
    children: <Subtitle />,
  },
}

function Subtitle() {
  return (
    <div className='flex flex-col'>
      <h2 className='font-normal text-lg'>What is dotelier studio?</h2>
      <p className='text-sm'>
        A pixel icon generator created by Grace Yun.
        <br />
        Powered by a fine-tuned FLUX.1 [dev] model.
      </p>
    </div>
  )
}
