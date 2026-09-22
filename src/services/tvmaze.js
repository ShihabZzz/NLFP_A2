const BASE_URL = 'https://api.tvmaze.com';

/**
 * Upper-bound estimate of catalog pages, used only to render the numbered
 * page buttons and the "of N" label before the real end is known.
 *
 * TVMaze does not report a total, and its page count drifts as shows are
 * added/removed, so this must NOT be treated as authoritative: the real end
 * of the catalog is detected at runtime when a page answers HTTP 404
 * (mapped to an empty array by fetchShows). This estimate is deliberately
 * generous so Next is never disabled prematurely.
 */
export const TOTAL_CATALOG_PAGES = 500;

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
 * Formats a numeric rating for display, e.g. 8 -> "8.0", 7.65 -> "7.7".
 * Accepts legacy string ratings defensively; returns null when unrated.
 * @param {number|string|null|undefined} rating
 * @returns {string|null}
 */
export function formatRating(rating) {
  if (rating == null || rating === '') return null;
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : null;
}

/**
 * Normalizes raw show data from either /shows or /search/shows endpoints.
 * Missing fields stay null rather than being replaced with display copy, so
 * callers decide how (or whether) to present them.
 * @param {Object} item
 * @returns {Object} Normalized show object
 */
export function normalizeShow(item) {
  const show = item.show ? item.show : item;

  const releaseYear = show.premiered
    ? show.premiered.split('-')[0]
    : show.ended
    ? show.ended.split('-')[0]
    : null;

  // Keep as a number so sorting/comparison works; format at render time.
  const ratingValue = show.rating?.average ? Number(show.rating.average) : null;

  return {
    id: show.id,
    title: show.name || 'Untitled',
    year: releaseYear,
    premiered: show.premiered || null,
    rating: ratingValue,
    genres: Array.isArray(show.genres) ? show.genres : [],
    summary: cleanSummary(show.summary),
    image: {
      medium: show.image?.medium || null,
      original: show.image?.original || show.image?.medium || null,
    },
    language: show.language || null,
    runtime: show.runtime || show.averageRuntime || null,
    status: show.status || null,
    network: show.network?.name || show.webChannel?.name || null,
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
      // Past the end of the catalog: TVMaze answers 404 for out-of-range
      // pages. An empty array is the reliable "no more pages" signal.
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
