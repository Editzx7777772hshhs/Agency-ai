import { corsHeaders, handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface ResearchResult {
  summary: string
  painPoints: string[]
  opportunities: string[]
  angles: string[]
  hooks: string[]
  patterns: string[]
  suggestedTopics: string[]
  source: 'ai' | 'verified'
}

function isResearchResult(v: unknown): v is ResearchResult {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  return (
    typeof r.summary === 'string' &&
    Array.isArray(r.painPoints) &&
    Array.isArray(r.opportunities) &&
    Array.isArray(r.angles) &&
    Array.isArray(r.hooks) &&
    Array.isArray(r.patterns) &&
    Array.isArray(r.suggestedTopics)
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { topic, audience, platform } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return errorResponse('A research topic is required.')
    }

    const result = await generateStructuredJSON<ResearchResult>({
      system:
        'You are the VANTA AI research agent for content creators. You produce clearly-labeled AI-generated analysis, ' +
        'never claiming to have browsed the live web. You always set "source" to "ai". Return an object with keys: ' +
        'summary (string), painPoints (string[]), opportunities (string[]), angles (string[]), hooks (string[]), ' +
        'patterns (string[]), suggestedTopics (string[]), source ("ai").',
      prompt: `Topic: ${topic}\nAudience: ${audience || 'not specified'}\nPlatform: ${platform || 'not specified'}\n\nProduce 4-6 items per array field.`,
      validate: isResearchResult,
    })

    await logUsage(supabase, user.id, 'research')
    return jsonResponse({ ...result, source: 'ai' })
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while running research.', 500)
  }
})
