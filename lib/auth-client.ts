'use client'

import { createAuthClient } from 'better-auth/react'
import { googleClientId } from './auth-env'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : undefined,
  plugins: [],
})

export const { signIn, signUp, signOut, useSession } = authClient

export const isGoogleEnabled = Boolean(googleClientId)
