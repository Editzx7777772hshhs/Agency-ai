import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface MetadataResult {
  titles: string[]
  description: string
  hashtags: string[]
  keywords: string[]
  thumbnailText: string
  thumbnailConcept: string
}

function isMetadataResult(v: unknown): v is MetadataResult {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  return (
    Array.isArray(r.titles) &&
    typeof r.description === 'string' &&
    Array.isArray(r.hashtags) &&
    Array.isArray(r.keywords) &&
    typeof r.thumbnailText === 'string' &&
    typeof r.thumbnailConcept === 'string'
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { scriptText, platform, topic } = await req.json()

    if (!scriptText && !topic) {
      return errorResponse('A script or topic is required.')
    }

    const result = await generateStructuredJSON<MetadataResult>({
      system:
        'You are the VANTA AI metadata agent. Return an object with: titles (string[], exactly 5 click-worthy but ' +
        'non-clickbait options), description (string, platform-appropriate length), hashtags (string[], 8-15 relevant ' +
        'tags without the # symbol), keywords (string[], 8-12 SEO keywords/phrases), thumbnailText (string, <=5 words ' +
        'of bold on-thumbnail text), thumbnailConcept (string, a concrete visual description an editor could design from).',
      prompt: `Platform: ${platform || 'not specified'}\nTopic: ${topic || 'derive from script'}\nScript:\n${(scriptText || '').slice(0, 6000) || '(no script provided — use topic only)'}`,
      validate: isMetadataResult,
      maxTokens: 1800,
    })

    await logUsage(supabase, user.id, 'generate-metadata')
    return jsonResponse(result)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while generating metadata.', 500)
  }
})
