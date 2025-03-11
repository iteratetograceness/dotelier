import { createClient } from '@/app/db/supabase/server'
import { GoldCoin } from '@/app/icons/gold-coin'
import { FREE_CREDITS } from '@/app/utils/constants'
import { credits } from '@/app/utils/credits'
import Image from 'next/image'
import RetroLoader from '../loader'

export async function UserProfile() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return null

  const remainingCredits = await credits.get(userData.user.id)
  const name =
    userData.user.user_metadata.name ||
    userData.user.user_metadata.email.split('@')[0]

  return (
    <div className='flex p-5 bg-foreground w-screen gap-4 justify-between'>
      <div className='flex flex-col items-center justify-center -mt-8'>
        <div className='rounded-full size-[90px] overflow-hidden border-2 border-background flex flex-col items-center justify-center'>
          <Image
            src={userData.user.user_metadata.avatar_url}
            alt='user avatar'
            width={90}
            height={90}
          />
        </div>
        <span className='text-foreground bg-background rounded-full px-1 w-fit text-sm max-w-[100px] truncate -mt-4'>
          {name}
        </span>
      </div>
      <div className='flex flex-col gap-2 mt-auto'>
        <div className='flex items-center'>
          <div className='size-10 bg-background rounded-full overflow-hidden flex items-center justify-center z-10'>
            <GoldCoin className='pb-1' />
          </div>
          <div className='flex flex-col gap-0.5 -ml-1 relative'>
            <span className='text-foreground bg-background px-1 py-0 w-fit text-xs self-end absolute right-0 -top-3.5 rounded-tl-md rounded-tr-md'>
              {remainingCredits} credit{remainingCredits === 1 ? '' : 's'}
            </span>
            <div className='bg-background p-1'>
              <RetroLoader
                className='text-foreground relative bg-background'
                totalSegments={10}
                initialProgress={
                  Math.floor(remainingCredits / FREE_CREDITS) * 10
                }
                animate={false}
                title={undefined}
                height={10}
                segmentWidth={10}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
