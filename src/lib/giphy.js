const API = 'https://api.giphy.com/v1/gifs';
const safe = (u) => {
  try {
    return ['http:', 'https:'].includes(new URL(u).protocol);
  } catch {
    return false;
  }
};
const normalize = (g) => {
  const i = g.images?.fixed_width || g.images?.original;
  const original = g.images?.original?.url;
  return {
    id: g.id,
    title: g.title || 'Untitled GIF',
    preview: safe(i?.webp) ? i.webp : i?.url,
    original: safe(original) ? original : '',
    width: +i?.width || 480,
    height: +i?.height || 270,
    url: safe(g.url) ? g.url : '',
    creator: g.username || g.user?.display_name || 'GIPHY',
  };
};
async function call(endpoint, params, signal) {
  const key = import.meta.env.VITE_GIPHY_API_KEY;
  if (!key) throw new Error('Add VITE_GIPHY_API_KEY to .env.local to enable live GIPHY results.');
  const url = new URL(`${API}/${endpoint}`);
  url.search = new URLSearchParams({
    api_key: key,
    rating: 'g',
    limit: '20',
    bundle: 'messaging_non_clips',
    ...params,
  });
  let r;
  try {
    r = await fetch(url, { signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('Network request failed. Please retry.');
  }
  if (r.status === 429) throw new Error('GIPHY rate limit reached. Please wait and retry.');
  if (!r.ok) throw new Error(`GIPHY returned ${r.status}. Check the API key.`);
  const j = await r.json();
  return {
    items: (j.data || []).map(normalize).filter((x) => x.preview && x.url),
    more: (j.pagination?.total_count || 0) > (+params.offset || 0) + 20,
  };
}
export const trending = (offset, signal) => call('trending', { offset }, signal);
export const search = (q, offset, signal) =>
  call('search', { q: q.slice(0, 50), offset, lang: 'en' }, signal);
