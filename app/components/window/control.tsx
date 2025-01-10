import { BaseWindowProps } from './base'
import { Hand } from '../../icons/hand'
import { QuestionMark } from '../../icons/question-mark'
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
 */

export const initialWindows: WindowMap = {
  subtitle: {
    id: 'subtitle',
    zIndex: 1,
    isVisible: true,
  },
  ratelimitinfo: {
    id: 'ratelimitinfo',
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
  ratelimitinfo: {
    className: 'w-fit',
    children: <Ratelimit />,
  },
}

function Subtitle() {
  return (
    <div className='flex flex-col gap-3'>
      <QuestionMark />
      <h2 className='font-normal text-lg'>What is dotelier studio?</h2>
      <p className='text-sm text-center'>
        A pixel icon generator powered by Recraft AI
      </p>
    </div>
  )
}

function Ratelimit() {
  return (
    <div className='flex flex-col w-24 gap-4'>
      <Hand />
      <div>
        <h2 className='font-normal text-lg'>wait...</h2>
        <p>you do know that you get 3 free generations per day right?</p>
      </div>
    </div>
  )
}
