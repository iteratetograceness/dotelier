/**
 * Kysely database types.
 *
 * This file is normally produced by `bun generate-types` (kysely-codegen),
 * which introspects the live Postgres database and requires DATABASE_URL. It
 * is regenerated at build time on Vercel (`bun generate-types && next build`),
 * so the deployed types always reflect the real schema.
 *
 * It is committed here so that `bun type-check`, editors, and CI can resolve
 * the `kysely-codegen` module without database access. If the schema changes,
 * rerun `bun generate-types` locally to refresh it.
 */
import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export type JsonArray = JsonValue[]

export type JsonObject = {
  [x: string]: JsonValue | undefined
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type Json = ColumnType<JsonValue, string, string>

export type Privacy = 'private' | 'public'

export interface Pixel {
  id: Generated<string>
  userId: string
  prompt: string
  privacy: Generated<Privacy>
  showExplore: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp | null
}

export interface PixelVersion {
  id: Generated<string>
  pixelId: string
  fileKey: string
  version: Generated<number>
  isCurrent: Generated<boolean>
  gridSize: Generated<number | null>
  gridSettings: Json | null
  createdAt: Generated<Timestamp>
}

export interface PostProcessing {
  id: Generated<string>
  pixelId: string
  pngOriginalFileKey: string
  pngNobgFileKey: string | null
  status: Generated<string>
  errorMessage: string | null
  completedAt: Timestamp | null
  createdAt: Generated<Timestamp>
}

export interface User {
  id: Generated<string>
  name: string
  email: string
  emailVerified: Generated<boolean>
  image: string | null
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: Timestamp | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export interface Session {
  id: Generated<string>
  userId: string
  token: string
  expiresAt: Timestamp
  ipAddress: string | null
  userAgent: string | null
  impersonatedBy: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export interface Account {
  id: Generated<string>
  userId: string
  accountId: string
  providerId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Timestamp | null
  refreshTokenExpiresAt: Timestamp | null
  scope: string | null
  password: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export interface Verification {
  id: Generated<string>
  identifier: string
  value: string
  expiresAt: Timestamp
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export interface Jwks {
  id: Generated<string>
  publicKey: string
  privateKey: string
  createdAt: Generated<Timestamp>
}

export interface DB {
  account: Account
  jwks: Jwks
  pixel: Pixel
  pixelVersion: PixelVersion
  postProcessing: PostProcessing
  session: Session
  user: User
  verification: Verification
}
