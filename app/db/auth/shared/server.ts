import {
  Auth,
  builtinOAuthProviderNames,
  BuiltinOAuthProviderNames,
  InvalidDataError,
  OAuthProviderFailureError,
  PKCEError,
  TokenData,
} from '@edgedb/auth-core'
import { OAuthOptions, OAuthHelpers } from './client'
import { Client, ConfigurationError } from 'edgedb'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

type ParamsOrError<
  Result extends object,
  ErrorDetails extends object = object
> =
  | ({ error: null } & { [Key in keyof ErrorDetails]?: undefined } & Result)
  | ({ error: Error } & ErrorDetails & { [Key in keyof Result]?: undefined })

export abstract class OAuth extends OAuthHelpers {
  protected readonly auth: Promise<Auth>

  constructor(protected readonly client: Client, options: OAuthOptions) {
    super(options)
    this.auth = Auth.create(client)
  }

  async getProvidersInfo() {
    return (await this.auth).getProvidersInfo()
  }

  async setVerifierCookie(verifier: string) {
    const cookieStore = await cookies()
    const name = this.options.pkceVerifierCookieName ?? 'pkce'
    cookieStore.set({
      name,
      value: verifier,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: this.isSecure,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  async deleteVerifierCookie() {
    const cookieStore = await cookies()
    const name = this.options.pkceVerifierCookieName ?? 'pkce'
    cookieStore.delete(name)
  }

  async setAuthCookie(token: string) {
    const cookieStore = await cookies()
    const expirationDate = Auth.getTokenExpiration(token)
    const name = this.options.authCookieName ?? 'session'
    cookieStore.set({
      name,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: this.isSecure,
      expires: expirationDate ?? undefined,
    })
  }

  createAuthRouteHandlers({
    onOAuthCallback,
    onSignout,
  }: {
    onOAuthCallback: (
      params: ParamsOrError<{
        tokenData: TokenData
        provider: BuiltinOAuthProviderNames
        isSignUp: boolean
      }>,
      req: NextRequest
    ) => Promise<never>
    onSignout: (req: NextRequest) => Promise<NextResponse>
  }) {
    return {
      GET: async (
        req: NextRequest,
        {
          params,
        }: {
          params: Promise<{
            auth: string[]
          }>
        }
      ) => {
        const awaitedParams = await params
        const authPath = awaitedParams.auth.join('/')

        switch (authPath) {
          case 'oauth': {
            const provider = req.nextUrl.searchParams.get(
              'provider_name'
            ) as BuiltinOAuthProviderNames | null

            if (!provider || !builtinOAuthProviderNames.includes(provider)) {
              throw new InvalidDataError('Missing provider name')
            }

            const redirectUrl = `${this._authRoute}/oauth/callback`

            const authClient = await this.auth
            const pkceSession = await authClient.createPKCESession()
            await this.setVerifierCookie(pkceSession.verifier)

            const oauthUrl = pkceSession.getOAuthUrl(
              provider,
              redirectUrl,
              `${redirectUrl}?isSignUp=true`
            )

            return redirect(oauthUrl)
          }
          case 'oauth/callback': {
            if (!onOAuthCallback) {
              throw new ConfigurationError('onOAuthCallback not configured')
            }

            const error = req.nextUrl.searchParams.get('error')

            if (error) {
              const desc = req.nextUrl.searchParams.get('error_description')
              const providerError = new OAuthProviderFailureError(
                error + (desc ? `: ${desc}` : '')
              )
              return onOAuthCallback(
                {
                  error: providerError,
                },
                req
              )
            }

            const code = req.nextUrl.searchParams.get('code')

            if (!code) {
              const pkceError = new PKCEError('No pkce code in response')
              return onOAuthCallback(
                {
                  error: pkceError,
                },
                req
              )
            }

            const isSignUp = req.nextUrl.searchParams.get('isSignUp') === 'true'
            const pkceVerifierCookieName =
              this.options.pkceVerifierCookieName ?? 'pkce'
            const verifier = req.cookies.get(pkceVerifierCookieName)?.value

            if (!verifier) {
              const pkceError = new PKCEError('No pkce verifier cookie found')
              return onOAuthCallback(
                {
                  error: pkceError,
                },
                req
              )
            }

            let tokenData

            try {
              const authClient = await this.auth
              tokenData = await authClient.getToken(code, verifier)
            } catch (err) {
              return onOAuthCallback(
                {
                  error: err instanceof Error ? err : new Error(String(err)),
                },
                req
              )
            }

            await this.setAuthCookie(tokenData.auth_token)

            const cookieStore = await cookies()
            cookieStore.delete(pkceVerifierCookieName)

            const provider = req.nextUrl.searchParams.get(
              'provider'
            ) as BuiltinOAuthProviderNames

            return onOAuthCallback(
              {
                error: null,
                tokenData,
                provider,
                isSignUp,
              },
              req
            )
          }
          case 'signout': {
            if (!onSignout) {
              throw new ConfigurationError('onSignout not configured')
            }
            const cookieStore = await cookies()
            cookieStore.delete(this.options.authCookieName ?? 'session')
            return onSignout(req)
          }
          default:
            return NextResponse.json(
              { error: 'Unknown auth route' },
              { status: 404 }
            )
        }
      },
    }
  }
}

export class OAuthSession {
  public readonly client: Client

  constructor(client: Client, public readonly authToken: string | null) {
    this.client = authToken
      ? client.withGlobals({ 'ext::auth::client_token': this.authToken })
      : client
  }

  _isSignedIn: Promise<boolean> | null = null
  async isSignedIn(): Promise<boolean> {
    if (!this.authToken) return false
    return (
      this._isSignedIn ??
      (this._isSignedIn = this.client
        .queryRequiredSingle<boolean>(
          `select exists global ext::auth::ClientTokenIdentity`
        )
        .catch(() => false))
    )
  }
}
