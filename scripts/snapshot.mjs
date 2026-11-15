// Saves a copy of the Sanity content next to the built site (dist/content.json), so visitors
// whose browser can't reach sanity.io (ad blockers, firewalls, flaky networks) still get the
// real deals from GitHub Pages itself. Run after `vite build`.
// Writes `changed=true|false` to $GITHUB_OUTPUT so scheduled runs only redeploy on edits.
import { writeFileSync, appendFileSync } from 'node:fs';
import { fetchFrom } from '../src/cms.js';

const LIVE = 'https://aokttk-cmd.github.io/mizudeals/content.json';
const out = (k, v) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);

let data;
for (const host of ['api.sanity.io', 'apicdn.sanity.io']) {
  try { data = await fetchFrom(host, 20000); break; } catch (err) { console.warn(`[snapshot] ${err.message}`); }
}

let live = null;
try { const r = await fetch(`${LIVE}?t=${Date.now()}`); if (r.ok) live = await r.json(); } catch { /* first deploy */ }

if (!data) {
  if (!live?.data) { console.warn('[snapshot] Sanity unreachable and no previous snapshot; skipping.'); out('changed', 'false'); process.exit(0); }
  console.warn('[snapshot] Sanity unreachable; keeping the previous snapshot.');
  data = live.data;
}

// "Expired" filtering happens in the query, so a snapshot can go stale when a coupon expires;
// comparing the data (not timestamps) still catches that because the coupon drops out of the list.
const changed = JSON.stringify(data) !== JSON.stringify(live?.data);
writeFileSync('dist/content.json', JSON.stringify({ at: changed || !live ? Date.now() : live.at, data }));
console.log(`[snapshot] ${data.coupons.length} coupons, ${data.stores.length} stores · changed: ${changed}`);
out('changed', String(changed));
