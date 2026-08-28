import { supabase } from './supabase'

/**
 * Calls a Supabase Edge Function with the current user's auth token.
 * All AI generation goes through the backend — no API keys ever touch the frontend.
 *
 * @param {string} functionName - e.g. 'generate-ideas'
 * @param {object} payload - JSON body sent to the function
 * @returns {Promise<object>} parsed JSON response
 */
export async function callEdgeFunction(functionName, payload) {
  const { data: { session } } = await supabase.auth.getSession()

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  })

  if (error) {
    const message = error.context?.body?.error || error.message || 'Request failed'
    throw new ApiError(message, error.context?.status)
  }

  if (data?.error) {
    throw new ApiError(data.error, data.status)
  }

  return data
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
