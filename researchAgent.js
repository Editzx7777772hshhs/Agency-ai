import { callEdgeFunction } from '../lib/api'

/**
 * Runs the research agent for a topic/project. Backend returns structured JSON:
 * { summary, painPoints[], opportunities[], angles[], hooks[], patterns[], suggestedTopics[], source: 'ai' | 'verified' }
 */
export function runResearch({ projectId, topic, audience, platform }) {
  return callEdgeFunction('research', { projectId, topic, audience, platform })
}
