import e from '../../dbschema/edgeql-js'
import { Client } from 'edgedb'

export async function getUserName(client: Client) {
  const query = e.select(e.User, () => ({
    name: true,
  }))
  const user = await query.run(client)
  return user[0]?.name
}