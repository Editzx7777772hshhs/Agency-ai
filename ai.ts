// Thin wrapper around the Anthropic Messages API for all VANTA AI agents.
// The API key lives only in Supabase Edge Function secrets (ANTHROPIC_API_KEY) —
// it is never sent to or readable from the frontend.
//
// Check https://docs.claude.com/en/docs/about-claude/models for the current
// model name and update ANTHROPIC_MODEL below (or set it as an Edge Function
// secret) if this one has been retired.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-4-5-20250929'

export class AiError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.status = status
  }
}

/**
 * Calls Claude with a system prompt instructing strict-JSON output, retries
 * once on a malformed response, and validates the result with `validate`
 * before returning it. Throws AiError with a caller-safe message on any
 * failure — API errors, rate limits, empty responses, invalid JSON, or
 * network errors are all normalized here so route handlers stay simple.
 */
export async function generateStructuredJSON<T>(opts: {
  system: string
  prompt: string
  validate: (value: unknown) => value is T
  maxTokens?: number
}): Promise<T> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new AiError('AI service is not configured. Set ANTHROPIC_API_KEY as an Edge Function secret.', 503)
  }

  let lastError: string = 'Unknown error'

  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: opts.maxTokens ?? 2000,
          system: opts.system + '\n\nRespond with ONLY valid JSON. No prose, no markdown code fences, no preamble.',
          messages: [{ role: 'user', content: opts.prompt }],
        }),
      })
    } catch {
      lastError = 'Could not reach the AI service. Check your network and try again.'
      continue
    }

    if (res.status === 429) {
      throw new AiError('AI service rate limit reached. Please try again in a moment.', 429)
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      lastError = `AI service error (${res.status}).`
      if (res.status >= 500) continue // retry on server errors
      throw new AiError(lastError, res.status)
    }

    const data = await res.json().catch(() => null)
    const text: string | undefined = data?.content?.find((b: any) => b.type === 'text')?.text

    if (!text || !text.trim()) {
      lastError = 'AI service returned an empty response.'
      continue
    }

    const parsed = safeParseJSON(text)
    if (parsed === null) {
      lastError = 'AI service returned a malformed response.'
      continue
    }

    if (!opts.validate(parsed)) {
      lastError = 'AI service response did not match the expected format.'
      continue
    }

    return parsed
  }

  throw new AiError(lastError, 502)
}

function safeParseJSON(text: string): unknown {
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}
