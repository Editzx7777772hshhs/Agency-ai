import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface ScriptResult {
  title: string
  hook: string
  body: string
  cta: string
  ending: string
  visualSuggestions: string[]
}

function isScriptResult(v: unknown): v is ScriptResult {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  return (
    typeof r.title === 'string' &&
    typeof r.hook === 'string' &&
    typeof r.body === 'string' &&
    typeof r.cta === 'string' &&
    typeof r.ending === 'string' &&
    Array.isArray(r.visualSuggestions)
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { ideaTitle, ideaHook, ideaAngle, duration, platform, tone } = await req.json()

    if (!ideaTitle || typeof ideaTitle !== 'string') {
      return errorResponse('A content idea/title is required.')
    }

    const result = await generateStructuredJSON<ScriptResult>({
      system:
        'You are the VANTA AI script agent. Write a full, ready-to-record script matching the requested duration, ' +
        'platform and tone, including pattern interrupts inside the body for retention. Return an object with: ' +
        'title (string), hook (string, strong opener), body (string, the main content including intro and pattern ' +
        'interrupts, written as spoken narration), cta (string), ending (string), visualSuggestions (string[], ' +
        '3-6 concrete on-screen visual cues timed to the script).',
      prompt: `Idea: ${ideaTitle}\nHook idea: ${ideaHook || 'none given — write one'}\nAngle: ${ideaAngle || 'not specified'}\nDuration target: ${duration || '30 seconds'}\nPlatform: ${platform || 'not specified'}\nTone: ${tone || 'not specified'}`,
      validate: isScriptResult,
      maxTokens: 2500,
    })

    await logUsage(supabase, user.id, 'generate-script')
    return jsonResponse(result)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while generating the script.', 500)
  }
})
