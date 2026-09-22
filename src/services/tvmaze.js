const BASE_URL = 'https://api.tvmaze.com';

/**
 * Decodes HTML character references (&amp;, &#39;, &#x2019;, ...) in a string.
 *
 * Tag stripping alone leaves entities intact, so summaries render literally
 * as "A&amp;B" or "don&#39;t". We reuse the browser's HTML parser for a
 * complete entity table rather than a hand-maintained map. A textarea's
 * value is always plain text, so this cannot execute markup.
 *
 * @param {string} text
 * @returns {string} Decoded text
 */
export function decodeEntities(text) {
  if (!text) return text;
  if (typeof document === 'undefined') {
    // Non-browser fallback: numeric references only.
    return text
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      );
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Strips HTML tags from TVMaze summary strings and trims whitespace
 * @param {string} html
 * @returns {string} Plain text summary
 */
export function cleanSummary(html) {
  if (!html) return 'No description available for this title.';
  // Replace line breaks and paragraph closings with newlines, then strip remaining HTML tags.
  // Tags are removed before decoding so that a literal "&lt;b&gt;" in the source
  // survives as the text "<b>" instead of being parsed as a tag.
  const stripped = html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const text = decodeEntities(stripped)
    .replace(/\r\n?/g, '\n')
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
    // Only a genuine official site. Falling back to show.url here would make
    // the "Official Website" and "TVMaze Profile" links identical.
    officialSite: show.officialSite || null,
    tvmazeUrl: show.url || null,
  };
}

/**
 * Reports whether an error is the result of a cancelled (aborted) request.
 * Aborts are an intentional cancellation, not a failure, so callers should
 * skip their error handling for these.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isAbortError(error) {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Fetches default shows catalog
 * @param {number} page
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Cancels the request when aborted
 * @returns {Promise<Array>}
 */
export async function fetchShows(page = 0, { signal } = {}) {
  try {
    const res = await fetch(`${BASE_URL}/shows?page=${page}`, { signal });
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch shows (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.map(normalizeShow);
  } catch (error) {
    if (isAbortError(error)) throw error;
    console.error('Error fetching shows:', error);
    throw error;
  }
}

/**
 * Searches shows by query string
 * @param {string} query
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Cancels the request when aborted
 * @returns {Promise<Array>}
 */
export async function searchShows(query, { signal } = {}) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(trimmed)}`, {
      signal,
    });
    if (!res.ok) {
      throw new Error(`Failed to search shows (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.map(normalizeShow);
  } catch (error) {
    if (isAbortError(error)) throw error;
    console.error('Error searching shows:', error);
    throw error;
  }
}
