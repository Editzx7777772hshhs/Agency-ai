import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface Idea {
  title: string
  hook: string
  angle: string
  targetEmotion: string
  score: number
  format: string
}

function isIdeasResult(v: unknown): v is { ideas: Idea[] } {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  if (!Array.isArray(r.ideas) || r.ideas.length === 0) return false
  return r.ideas.every(
    (i: any) =>
      typeof i.title === 'string' &&
      typeof i.hook === 'string' &&
      typeof i.angle === 'string' &&
      typeof i.targetEmotion === 'string' &&
      typeof i.score === 'number' &&
      typeof i.format === 'string'
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { niche, platform, audience, tone, count } = await req.json()

    if (!niche || typeof niche !== 'string') {
      return errorResponse('Project niche is required.')
    }

    const n = Math.min(Math.max(Number(count) || 10, 1), 10)

    const result = await generateStructuredJSON<{ ideas: Idea[] }>({
      system:
        'You are the VANTA AI content idea agent. Generate distinct, non-repetitive content ideas tailored to the ' +
        'niche, platform, audience and tone given. Return an object { "ideas": [...] } where each idea has: ' +
        'title (string), hook (string, first line spoken/shown), angle (string), targetEmotion (string, e.g. curiosity, ' +
        'nostalgia, urgency), score (integer 0-100 estimating engagement potential), format (one of "short","long","carousel","live").',
      prompt: `Niche: ${niche}\nPlatform: ${platform || 'not specified'}\nAudience: ${audience || 'not specified'}\nTone: ${tone || 'not specified'}\n\nGenerate exactly ${n} ideas.`,
      validate: isIdeasResult,
      maxTokens: 2500,
    })

    await logUsage(supabase, user.id, 'generate-ideas')
    return jsonResponse(result)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while generating ideas.', 500)
  }
})
