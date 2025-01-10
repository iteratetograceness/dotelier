import { BuiltinOAuthProviderNames } from '@edgedb/auth-core'

export interface OAuthOptions {
  baseUrl: string
  authRoutesPath?: string
  authCookieName?: string
  pkceVerifierCookieName?: string
}

export abstract class OAuthHelpers {
  readonly options: OAuthOptions
  readonly isSecure: boolean

  constructor(options: OAuthOptions) {
    this.options = {
      baseUrl: options.baseUrl.replace(/\/$/, ''),
      authRoutesPath: options.authRoutesPath?.replace(/^\/|\/$/g, '') ?? 'auth',
      authCookieName: options.authCookieName ?? 'sesh',
      pkceVerifierCookieName: options.pkceVerifierCookieName ?? 'pkce',
    }
    this.isSecure = this.options.baseUrl.startsWith('https')
  }

  protected get _authRoute() {
    return `${this.options.baseUrl}/${this.options.authRoutesPath}`
  }

  getOAuthUrl(providerName: BuiltinOAuthProviderNames) {
    return `${this._authRoute}/oauth?${new URLSearchParams({
      provider_name: providerName,
    }).toString()}`
  }

  getSignoutUrl() {
    return `${this._authRoute}/signout`
  }
}
