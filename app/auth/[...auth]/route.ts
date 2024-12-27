import { redirect } from 'next/navigation'
import { auth, db } from '@/app/db/client'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

const handlers = auth.createAuthRouteHandlers({
  async onOAuthCallback({ error, tokenData, isSignUp }) {
    if (error) {
      console.log('Error returned from onOAuthCallback', error)
      redirect('/?oauth_error=1')
    }

    if (isSignUp) {
      const providerToken = tokenData.provider_token
      const userData = await getUserDetails(providerToken)
      const authToken = tokenData.auth_token
      const authedClient = db.withGlobals({
        'ext::auth::client_token': authToken,
      })

      await authedClient.query(
        `
        with
          email := <optional str>$email,
          name := <optional str>$name,
        insert User {
          email := email,
          name := name,
          identity := (global ext::auth::ClientTokenIdentity)
        };
        `,
        { email: userData.email, name: userData.name }
      )
    }

    redirect('/')
  },
  onSignout() {
    revalidatePath('/')
    redirect('/explore')
  },
})

export const GET = async (
  request: NextRequest,
  context: {
    params: Promise<{
      auth: string[]
    }>
  }
) => {
  const params = await context.params
  return handlers.GET(request, { params })
}

export const POST = async (
  request: NextRequest,
  context: {
    params: Promise<{
      auth: string[]
    }>
  }
) => {
  const params = await context.params
  return handlers.POST(request, { params })
}

async function getUserDetails(providerToken: string | null) {
  if (!providerToken) return { email: '', name: '' }

  try {
    const response = await fetch(
      'https://accounts.google.com/.well-known/openid-configuration'
    )
    const data = await response.json()
    const userInfoResponse = await fetch(data.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${providerToken}`,
        Accept: 'application/json',
      },
    })

    const userData = (await userInfoResponse.json()) as {
      email: string
      name: string
    }
    invariantCheck(userData)
    return userData
  } catch (error) {
    console.error('Failed to fetch user details: ', error)
    return { email: '', name: '' }
  }
}

function invariantCheck(maybeUserData: unknown) {
  if (!maybeUserData || typeof maybeUserData !== 'object') {
    throw new Error('Invalid user data')
  }

  if (
    !('email' in maybeUserData) ||
    !('name' in maybeUserData) ||
    typeof maybeUserData.email !== 'string' ||
    typeof maybeUserData.name !== 'string'
  ) {
    throw new Error('Invalid user data')
  }

  const { email, name } = maybeUserData
  return { email, name }
}
