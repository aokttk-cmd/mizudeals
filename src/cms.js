// Loads site content from Sanity (edited by staff in Mizu Deals Studio).
// Sample data is only used when Sanity isn't configured (e.g. a fresh local checkout).
import * as sample from './data.js';

// Public settings — the project ID is not a secret (the dataset is read-only to the public).
export const SANITY = {
  projectId: 'flsjgqi9',
  dataset: 'production',
  apiVersion: 'v2025-02-19',
};

const QUERY = `{
  "stores": *[_type == "store" && defined(slug.current)] | order(order asc, name asc) {
    "id": slug.current, name, "cat": category, color, website,
    "featured": featured != false,
    "logo": logo.asset->url,
    "coupons": count(*[_type == "coupon" && references(^._id) && (!defined(expiresAt) || expiresAt > now())])
  },
  "coupons": *[_type == "coupon" && trending != false && defined(store) && (!defined(expiresAt) || expiresAt > now())]
    | order(order asc, usedCount desc) {
      "store": store->slug.current, title, type, code, url,
      "used": coalesce(usedCount, 0), "cat": store->category
    },
  "guides": *[_type == "guide"] | order(publishedAt desc)[0...8] {
    tag, title, "date": publishedAt, "hue": color, "slug": slug.current
  },
  "faqs": *[_type == "faq"] | order(order asc) { "q": question, "a": answer }
}`;

const fmtDate = (d) => {
  if (!d || !/^\d{4}-\d{2}-\d{2}/.test(d)) return d || '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

function fromSample() {
  return {
    source: 'sample',
    stores: sample.stores.map((s) => ({ ...s, featured: true })),
    coupons: sample.coupons,
    guides: sample.guides,
    faqs: sample.faqs,
  };
}

const CACHE_KEY = 'mizudeals:content:v1';

function normalise(result) {
  if (!result?.stores?.length) throw new Error('No stores published yet');
  const ids = new Set(result.stores.map((s) => s.id));
  return {
    stores: result.stores.map((s) => ({ ...s, color: s.color || '#2b8cff' })),
    coupons: result.coupons.filter((c) => ids.has(c.store) && (c.type !== 'code' || c.code)),
    guides: result.guides.map((g) => ({ ...g, hue: g.hue || '#8a2be2', date: fmtDate(g.date) })),
    faqs: result.faqs,
  };
}

async function fetchFrom(host, timeoutMs) {
  const { projectId, dataset, apiVersion } = SANITY;
  const url = `https://${projectId}.${host}/${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(QUERY)}&perspective=published`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`${host} responded ${res.status}`);
    const { result } = await res.json();
    return normalise(result);
  } catch (err) {
    throw new Error(`${host}: ${err.name === 'AbortError' ? `timed out after ${timeoutMs / 1000}s` : err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; } };
const writeCache = (data) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* storage blocked */ } };

/**
 * Order of preference: Sanity CDN → Sanity API (uncached) → last good copy saved in this
 * browser → empty "couldn't load" state (sample data only when Sanity isn't configured). `source` and `errors` say which one was used and why.
 */
export async function loadContent({ timeoutMs = 6000 } = {}) {
  const { projectId } = SANITY;
  if (!projectId || projectId === 'REPLACE_ME') return { source: 'sample', errors: ['Sanity not configured'], ...fromSample() };

  const errors = [];
  for (const host of ['apicdn.sanity.io', 'api.sanity.io']) {
    try {
      const data = await fetchFrom(host, timeoutMs);
      writeCache(data);
      return { source: host.startsWith('apicdn') ? 'sanity-cdn' : 'sanity-api', errors, ...data };
    } catch (err) {
      errors.push(err.message);
    }
  }
  console.warn('[Mizu Deals] Could not load from Sanity:', errors.join(' | '));
  const cached = readCache();
  if (cached?.data) return { source: 'browser-cache', cachedAt: cached.at, errors, ...cached.data };
  // Never show the made-up sample coupons on the live site: they'd look like real deals
  // that staff already removed. Show an empty "couldn't load" state instead.
  return { source: 'offline', errors, stores: [], coupons: [], guides: [], faqs: sample.faqs };
}
