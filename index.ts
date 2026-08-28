import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { generateStructuredJSON, AiError } from '../_shared/ai.ts'
import { logUsage } from '../_shared/usage.ts'

interface AnalysisResult {
  whatWorked: string[]
  whatDidNotWork: string[]
  possibleReasons: string[]
  improvements: string[]
  nextTopics: string[]
}

function isAnalysisResult(v: unknown): v is AnalysisResult {
  if (typeof v !== 'object' || v === null) return false
  const r = v as any
  return (
    Array.isArray(r.whatWorked) &&
    Array.isArray(r.whatDidNotWork) &&
    Array.isArray(r.possibleReasons) &&
    Array.isArray(r.improvements) &&
    Array.isArray(r.nextTopics)
  )
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { supabase, user } = await requireUser(req)
    const { entries } = await req.json()

    if (!Array.isArray(entries) || entries.length === 0) {
      return errorResponse('At least one performance entry is required.')
    }

    // Only ever pass numbers the user explicitly logged — the AI is told
    // plainly that this is the entire dataset, so it never implies it has
    // pulled real platform analytics on its own.
    const summarized = entries
      .slice(0, 20)
      .map((e: any, i: number) => `Entry ${i + 1}: views=${e.views ?? 0}, likes=${e.likes ?? 0}, comments=${e.comments ?? 0}, shares=${e.shares ?? 0}, watch_time=${e.watch_time ?? 0}`)
      .join('\n')

    const result = await generateStructuredJSON<AnalysisResult>({
      system:
        'You are the VANTA AI analytics agent. You only ever see numbers the creator manually logged — you have no ' +
        'access to their real platform dashboard, so never claim to know anything beyond the entries given. Return ' +
        'an object with: whatWorked (string[]), whatDidNotWork (string[]), possibleReasons (string[]), ' +
        'improvements (string[]), nextTopics (string[]). Base every point strictly on the provided numbers.',
      prompt: `User-logged performance entries (this is the complete dataset — nothing else is available):\n${summarized}`,
      validate: isAnalysisResult,
      maxTokens: 1800,
    })

    await logUsage(supabase, user.id, 'analyze-analytics')
    return jsonResponse(result)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, 401)
    if (err instanceof AiError) return errorResponse(err.message, err.status)
    return errorResponse('Unexpected error while analyzing performance.', 500)
  }
})
