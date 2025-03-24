import { Cooper } from '@/app/icons/cooper'
import { Louie } from '@/app/icons/louie'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../button'
import { SimpleContainer } from '../container/simple'

export function NewPixelInput() {
  return (
    <div className='flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-24'>
      <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
        <div className='relative mt-20'>
          <Cooper
            className='absolute -top-[75px] left-0 -z-10'
            width={120}
            height={120}
          />
          <Louie
            className='absolute -top-[85px] left-[72px] -z-20'
            width={120}
            height={140}
          />
          <SimpleContainer
            classNameOuter='w-[200px]'
            classNameInner='z-10 px-3 text-center'
            addBorder
          >
            <p>create a pixel icon</p>
          </SimpleContainer>
        </div>
      </div>
      <form className='flex flex-col gap-2 mt-8'>
        <div className='flex gap-1'>
          <label className='flex flex-col gap-1' htmlFor='prompt'>
            <p className='text-xs bg-foreground text-background px-2 py-1 w-fit'>
              prompt
            </p>
          </label>
          <span className='text-xs px-2 py-1 bg-medium w-fit'>
            Tip: It helps to specify colors
          </span>
        </div>
        <textarea
          className='w-full bg-foreground text-background px-3 py-2 focus:outline-none resize-y min-h-10 h-32 max-h-80 placeholder:text-background/75'
          id='prompt'
          name='prompt'
          placeholder='a lop-ear rabbit sonny angel'
          required
        />
        <input type='hidden' name='id' value={uuidv4()} />
        <div className='flex w-full gap-2'>
          <Button type='reset'>clear</Button>
          <Button className='flex-1'>start</Button>
        </div>
      </form>
    </div>
  )
}
