'use server'

import { cookies } from 'next/headers'

const TOKEN_KEY = 'gs_token'

export async function getToken(): Promise<string | null> {
  const c = await cookies()
  return c.get(TOKEN_KEY)?.value ?? null
}

export async function setToken(token: string): Promise<void> {
  const c = await cookies()
  c.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearToken(): Promise<void> {
  const c = await cookies()
  c.delete(TOKEN_KEY)
}
