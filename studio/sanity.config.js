import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { projectId, dataset } from './env.js';
import { schemaTypes } from './schemaTypes/index.js';

export default defineConfig({
  name: 'mizudeals',
  title: 'Mizu Deals',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('coupon').title('Coupons'),
            S.documentTypeListItem('store').title('Stores'),
            S.divider(),
            S.documentTypeListItem('guide').title('Guides'),
            S.documentTypeListItem('faq').title('FAQs'),
          ]),
    }),
    visionTool(), // GROQ query playground (admins)
  ],
  schema: { types: schemaTypes },
});
