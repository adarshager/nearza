/**
 * Nearza — Local Search History Storage Helper
 * Keeps user search history locally for fast, privacy-preserving queries.
 */

const HISTORY_KEY = 'nearza_search_history';
const MAX_HISTORY = 20;

export function getSearchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchQuery(query, category = null) {
  if (!query || !query.trim()) return;
  const clean = query.trim();

  try {
    const history = getSearchHistory();
    // Filter out previous duplicate of this query
    const filtered = history.filter((item) => item.query.toLowerCase() !== clean.toLowerCase());

    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      query: clean,
      category: category || null,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save search history:', err);
    return [];
  }
}

export function removeSearchQuery(queryId) {
  try {
    const history = getSearchHistory();
    const updated = history.filter((item) => item.id !== queryId && item.query !== queryId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove query from history:', err);
    return [];
  }
}

export function clearSearchHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear search history:', err);
    return [];
  }
}
