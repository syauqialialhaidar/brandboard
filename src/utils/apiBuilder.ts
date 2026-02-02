import { useAppStore } from '@/stores/app'

// --- MODIFIED ---
// Use the environment variable, with a fallback to the original hardcoded value
const API_BASE_URL = import.meta.env.VITE_API_DATA_URL || 'http://154.26.134.72:7878'
// --- END MODIFICATION ---

/**
 * Encodes a string array into a comma-separated, Base64-encoded string.
 * @param {string[]} values
 * @returns {string}
 */
function encodeParam(values: string[]): string {
  if (!values || values.length === 0) return ''
  
  const paramString = values.join(',')
  
  // Solusi untuk btoa dengan karakter Unicode:
  // 1. Encode string ke URI Component
  // 2. Ubah %xx back into string bytes
  // 3. Lakukan btoa
  return btoa(encodeURIComponent(paramString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}

/**
 * Builds the complete query string from the global Pinia store
 * and merges optional additional parameters.
 * @param {Record<string, string[]>} [additionalParams={}] - Optional extra filters to merge.
 * @returns {string}
 */
export function buildApiParams(additionalParams: Record<string, string[]> = {}): string {
  const appStore = useAppStore()
  const params = new URLSearchParams()

  params.set('from_date', appStore.startDate)
  params.set('to_date', appStore.endDate)

  // --- MODIFICATION: Combine store filters with additionalParams ---

  // Helper to merge arrays and remove duplicates
  const mergeParams = (storeValues: string[], additionalValues: string[] = []): string[] => {
    return [...new Set([...storeValues, ...additionalValues])]
  }

  // 1. Channels
  const channels = mergeParams(appStore.selectedChannels, additionalParams.channel)
  if (channels.length > 0) {
    params.set('channel', encodeParam(channels))
  }

  // 2. Categories
  const categories = mergeParams(appStore.selectedCategories, additionalParams.category)
  if (categories.length > 0) {
    params.set('category', encodeParam(categories))
  }

  // 3. Other known parameters (group, brand, etc.)
  // We can just loop over the keys in additionalParams that we haven't handled
  const handledKeys = ['channel', 'category']
  for (const key in additionalParams) {
    if (!handledKeys.includes(key)) {
      const values = additionalParams[key]
      // Pastikan values adalah array sebelum di-encode
      if (Array.isArray(values) && values.length > 0) {
        params.set(key, encodeParam(values))
      }
    }
  }
  // -------------------------------------------------------------

  params.set('sort', 'date')
  params.set('page', '1')
  params.set('items', '10') // Note: 'top/brand' might need more items

  return params.toString()
}

/**
 * Helper function to fetch data from an endpoint.
 * @param {string} endpoint
 * @param {Record<string, string[]>} [additionalParams={}] - Optional extra filters.
 * @returns {Promise<any>}
 */
export async function fetchData(endpoint: string, additionalParams: Record<string, string[]> = {}) {
  // Pass additionalParams to the builder
  const params = buildApiParams(additionalParams)
  const url = `${API_BASE_URL}/${endpoint}?${params}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    return null
  }
}
