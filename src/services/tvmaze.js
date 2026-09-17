const BASE_URL = 'https://api.tvmaze.com';

/**
 * Strips HTML tags from TVMaze summary strings and trims whitespace
 * @param {string} html 
 * @returns {string} Plain text summary
 */
export function cleanSummary(html) {
  if (!html) return 'No description available for this title.';
  // Replace line breaks and paragraph closings with newlines, then strip remaining HTML tags
  const text = html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  return text || 'No description available for this title.';
}

/**
 * Normalizes raw show data from either /shows or /search/shows endpoints
 * @param {Object} item 
 * @returns {Object} Normalized show object
 */
export function normalizeShow(item) {
  const show = item.show ? item.show : item;
  
  const releaseYear = show.premiered
    ? show.premiered.split('-')[0]
    : show.ended
    ? show.ended.split('-')[0]
    : 'TBA';

  const ratingValue = show.rating?.average
    ? Number(show.rating.average).toFixed(1)
    : null;

  return {
    id: show.id,
    title: show.name || 'Untitled',
    year: releaseYear,
    premiered: show.premiered || 'Unknown',
    rating: ratingValue,
    genres: Array.isArray(show.genres) ? show.genres : [],
    summary: cleanSummary(show.summary),
    image: {
      medium: show.image?.medium || null,
      original: show.image?.original || show.image?.medium || null,
    },
    language: show.language || 'English',
    runtime: show.runtime || show.averageRuntime || null,
    status: show.status || 'Unknown',
    network: show.network?.name || show.webChannel?.name || 'N/A',
    officialSite: show.officialSite || show.url || null,
    tvmazeUrl: show.url || null,
  };
}

/**
 * Fetches default shows catalog
 * @param {number} page 
 * @returns {Promise<Array>}
 */
export async function fetchShows(page = 0) {
  try {
    const res = await fetch(`${BASE_URL}/shows?page=${page}`);
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch shows (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.map(normalizeShow);
  } catch (error) {
    console.error('Error fetching shows:', error);
    throw error;
  }
}

/**
 * Searches shows by query string
 * @param {string} query 
 * @returns {Promise<Array>}
 */
export async function searchShows(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(trimmed)}`);
    if (!res.ok) {
      throw new Error(`Failed to search shows (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.map(normalizeShow);
  } catch (error) {
    console.error('Error searching shows:', error);
    throw error;
  }
}
