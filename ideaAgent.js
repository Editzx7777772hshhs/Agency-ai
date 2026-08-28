import { callEdgeFunction } from '../lib/api'

/**
 * Requests 10 structured content ideas for a project.
 * Returns: { ideas: [{ title, hook, angle, targetEmotion, score, format }] }
 */
export function generateIdeas({ projectId, niche, platform, audience, tone, count = 10 }) {
  return callEdgeFunction('generate-ideas', { projectId, niche, platform, audience, tone, count })
}
