import { callEdgeFunction } from '../lib/api'

/**
 * Generates metadata for a piece of content.
 * Returns: { titles[5], description, hashtags[], keywords[], thumbnailText, thumbnailConcept }
 */
export function generateMetadata({ scriptText, platform, topic }) {
  return callEdgeFunction('generate-metadata', { scriptText, platform, topic })
}
