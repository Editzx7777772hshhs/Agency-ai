import { callEdgeFunction } from '../lib/api'

/**
 * Generates a structured script from an idea.
 * Returns: { title, hook, body, cta, ending, visualSuggestions[] }
 */
export function generateScript({ projectId, ideaId, ideaTitle, ideaHook, ideaAngle, duration, platform, tone }) {
  return callEdgeFunction('generate-script', {
    projectId, ideaId, ideaTitle, ideaHook, ideaAngle, duration, platform, tone,
  })
}
