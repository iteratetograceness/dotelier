import { BaseWindowProps } from '../components/window/base'
import { Hand } from '../icons/hand'
import { QuestionMark } from '../icons/question-mark'
import { WindowData } from './portals'

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

export const initialWindows: Record<string, WindowData> = {
  subtitle: {
    id: 'subtitle',
    zIndex: 1,
    isVisible: true,
  },
  ratelimit: {
    id: 'ratelimit',
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
    windowId: 'ratelimit',
    anchorElementId: 'output',
    deltaX: 350,
    deltaY: -300,
  },
]

type WindowMetadata = Pick<
  BaseWindowProps,
  'variant' | 'title' | 'children' | 'className'
>

export const windowMetadata: Record<string, WindowMetadata> = {
  subtitle: {
    className: 'w-fit',
    variant: 'secondary',
    children: <Subtitle />,
  },
  ratelimit: {
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
