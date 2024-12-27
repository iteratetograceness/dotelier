import { auth } from '../db/client'
import { getUserName } from '../db'

// TODO: Funky enter animation

export async function Welcome() {
  const session = auth.getSession()

  if (!session.authToken) {
    return <p>Welcome!</p>
  }

  const name = await getUserName(session.client)

  return (
    <p>
      Welcome
      {name ? `, ${name.length > 20 ? `${name.slice(0, 13)}...` : name}` : ''}!
    </p>
  )
}
