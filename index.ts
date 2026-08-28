import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface Scene {
  timestamp: string
  narration: string
  visual: string
  broll: string
  onScreenText: string
  transition: string
}

function isBlueprintResult(v: unknown): v is { scenes: Scene[] } {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  if (!Array.isArray(r.scenes) || r.scenes.length === 0) return false
  return r.scenes.every(
    (s: any) =>
      typeof s.timestamp === 'string' &&
      typeof s.narration === 'string' &&
      typeof s.visual === 'string' &&
      typeof s.broll === 'string' &&
      typeof s.onScreenText === 'string' &&
      typeof s.transition === 'string'
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { script } = await req.json()

    if (!script || typeof script !== 'string') {
      return errorResponse('A script is required to build a blueprint.')
    }

    const result = await generateStructuredJSON<{ scenes: Scene[] }>({
      system:
        'You are the VANTA AI video blueprint agent. VANTA does not auto-render video — you produce a scene-by-scene ' +
        'production plan a human editor can follow. Return an object { "scenes": [...] } where each scene has: ' +
        'timestamp (string, e.g. "0-3 sec"), narration (string, matching that portion of the script), ' +
        'visual (string, on-camera/primary visual suggestion), broll (string, supporting b-roll suggestion), ' +
        'onScreenText (string, any text overlay, or "" if none), transition (string, cut/transition into the next scene).',
      prompt: `Script:\n${script.slice(0, 6000)}\n\nBreak this into 5-10 scenes covering the full script.`,
      validate: isBlueprintResult,
      maxTokens: 2500,
    })

    await logUsage(supabase, user.id, 'generate-video-blueprint')
    return jsonResponse(result)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while generating the blueprint.', 500)
  }
})
