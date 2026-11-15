// Loads site content from Sanity (edited by staff in Mizu Deals Studio).
// Falls back to the bundled sample data if Sanity isn't configured or can't be reached.
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

export async function loadContent({ timeoutMs = 5000 } = {}) {
  const { projectId, dataset, apiVersion } = SANITY;
  if (!projectId || projectId === 'REPLACE_ME') return fromSample();

  const url = `https://${projectId}.apicdn.sanity.io/${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent(QUERY)}&perspective=published`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Sanity responded ${res.status}`);
    const { result } = await res.json();
    if (!result?.stores?.length) throw new Error('No stores published yet');
    const ids = new Set(result.stores.map((s) => s.id));
    return {
      source: 'sanity',
      stores: result.stores.map((s) => ({ ...s, color: s.color || '#2b8cff' })),
      coupons: result.coupons.filter((c) => ids.has(c.store) && (c.type !== 'code' || c.code)),
      guides: result.guides.map((g) => ({ ...g, hue: g.hue || '#8a2be2', date: fmtDate(g.date) })),
      faqs: result.faqs,
    };
  } catch (err) {
    console.warn('[Mizu Deals] Using sample content:', err.message);
    return fromSample();
  } finally {
    clearTimeout(timer);
  }
}
