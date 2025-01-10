import { OAuthHelpers, OAuthOptions } from './shared/client'

export default function createClientAuth(options: OAuthOptions) {
  return new ClientOAuth(options)
}

export class ClientOAuth extends OAuthHelpers {
  constructor(options: OAuthOptions) {
    super(options)
  }
}
