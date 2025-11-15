// hooks/useAuthFetch.ts
'use client'

import { useRouter } from 'next/navigation'
import { getToken, saveToken } from './Token'
import useAuth from '@/services/useAuth'

type FetchInit = RequestInit & { _retry?: boolean }

let isRefreshing = false
let refreshPromise: Promise<any> | null = null

export default function useAuthFetch() {
    const { refresh } = useAuth()
    const router = useRouter()

    const authFetch = async (input: RequestInfo | URL, init?: FetchInit) => {
        const makeHeaders = (token?: string | null, base?: HeadersInit) => {
            const h = new Headers(base)
            if (token) h.set('Authorization', `Bearer ${token}`)

            return h
        }

        const doFetch = (token?: string | null, overrideInit?: FetchInit) =>
            fetch(input, {
                ...(overrideInit ?? init),
                headers: makeHeaders(token, init?.headers),
                credentials: init?.credentials ?? 'include',
            })

        const accessToken = getToken()
        let res = await doFetch(accessToken)
        
        if (res.status !== 401) return res
        
        console.log('[authFetch] Got 401, _retry:', init?._retry)
        
        if (init?._retry) {
            console.log('[authFetch] Already retried, redirecting to /auth')
            router.push('/auth')
            return new Response(JSON.stringify({ error: 'Authentication failed' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        console.log('[authFetch] First 401, attempting refresh...')
        try {
            if (!isRefreshing) {
                console.log('[authFetch] Starting new refresh...')
                isRefreshing = true
                refreshPromise = refresh()
                    .then(data => {
                        console.log('[authFetch] Refresh succeeded')
                        isRefreshing = false
                        refreshPromise = null
                        return data
                    })
                    .catch(error => {
                        console.log('[authFetch] Refresh failed:', error)
                        isRefreshing = false
                        refreshPromise = null
                        throw error
                    })
            } else {
                console.log('[authFetch] Waiting for existing refresh...')
            }

            const refreshData = await refreshPromise
            console.log('[authFetch] Refresh data:', JSON.stringify(refreshData))
            
            const newToken = refreshData?.data?.accessToken || refreshData?.data?.token
            
            if (!refreshData || !newToken) {
                console.log('[authFetch] No token in refresh response, redirecting')
                router.push('/auth')
                return new Response(JSON.stringify({ error: 'Refresh failed' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                })
            }
            
            saveToken(newToken)
            
            const retryInit: FetchInit = { ...(init || {}), _retry: true }
            res = await doFetch(newToken, retryInit)
            console.log('[authFetch] Retry response status:', res.status)
            return res
        } catch (error) {
            console.log('[authFetch] Refresh threw error, redirecting:', error)
            router.push('/auth')
            return new Response(JSON.stringify({ error: 'Authentication error' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    }

    return { authFetch }
}
