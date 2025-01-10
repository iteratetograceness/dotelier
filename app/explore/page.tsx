import { getPixelatedIcons } from '../db'
import { db } from '../db/client'
import { IconGrid } from '../components/explore/grid'
import { PublicIcon } from '../components/explore/icon'

export default async function Explore() {
  const icons: PublicIcon[] = await getPixelatedIcons(db)

  return (
    <div className='flex items-center justify-center'>
      <IconGrid icons={icons} />
    </div>
  )
}
