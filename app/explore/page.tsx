import { Category, Pixel, User } from '@/dbschema/interfaces'
import { getPixelatedIcons } from '../db'
import { db } from '../db/client'
import { IconGrid } from '../components/explore/grid'
import { Screen } from '../components/explore/screen'
export type PublicIcon = Pick<Pixel, 'id' | 'prompt' | 'url' | 'created_at'> & {
  category: Pick<Category, 'slug'> | null
  owner: Pick<User, 'name'> | null
}

export default async function Explore() {
  const icons: PublicIcon[] = await getPixelatedIcons(db)

  return (
    <div className='flex p-4 items-center justify-center'>
      <Screen>
        <IconGrid icons={icons} />
      </Screen>
    </div>
  )
}
