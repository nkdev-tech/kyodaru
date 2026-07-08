import { env } from 'cloudflare:workers'
import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { db } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  secret: env.BETTER_AUTH_SECRET as string,
  baseURL: env.BETTER_AUTH_URL as string,
  trustedOrigins: [
    'mobile://',
    ...(process.env.NODE_ENV === 'development'
      ? [
          'exp://', // Trust all Expo URLs (prefix matching)
          'exp://**', // Trust all Expo URLs (wildcard matching)
          'exp://192.168.*.*:*/**', // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 400, // 400日（秒）
    updateAge: 60 * 60 * 24, // 1日（秒）
  },
  plugins: [anonymous(), expo()],
})

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}
