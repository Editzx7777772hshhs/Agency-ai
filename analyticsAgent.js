import { callEdgeFunction } from '../lib/api'

/**
 * Analyzes user-supplied performance numbers (never invents platform data).
 * Returns: { whatWorked[], whatDidNotWork[], possibleReasons[], improvements[], nextTopics[] }
 */
export function analyzePerformance({ projectId, entries }) {
  return callEdgeFunction('analyze-analytics', { projectId, entries })
}
