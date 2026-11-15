import { defineField, defineType } from 'sanity';

export const coupon = defineType({
  name: 'coupon',
  title: 'Coupon',
  type: 'document',
  fields: [
    defineField({
      name: 'title', title: 'Offer title', type: 'string',
      description: 'e.g. “20% off your first order”',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'store', title: 'Store', type: 'reference', to: [{ type: 'store' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'type', title: 'Type', type: 'string',
      options: {
        list: [
          { title: 'Code — shopper copies a code', value: 'code' },
          { title: 'Deal — no code, link only', value: 'deal' },
        ],
        layout: 'radio',
      },
      initialValue: 'code',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'code', title: 'Coupon code', type: 'string',
      hidden: ({ parent }) => parent?.type === 'deal',
      validation: (r) =>
        r.custom((value, ctx) => (ctx.parent?.type === 'code' && !value ? 'A code is required for code-type coupons' : true)),
    }),
    defineField({
      name: 'url', title: 'Deal / affiliate link', type: 'url',
      description: 'Where “Get deal” sends shoppers. Falls back to the store website.',
    }),
    defineField({
      name: 'usedCount', title: '“Used” count', type: 'number',
      description: 'Shown as “Used N times”.', initialValue: 0,
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: 'expiresAt', title: 'Expires', type: 'datetime',
      description: 'Optional. The coupon disappears from the site automatically after this.',
    }),
    defineField({
      name: 'trending', title: 'Show in “Trending right now”', type: 'boolean', initialValue: true,
    }),
    defineField({
      name: 'order', title: 'Sort order', type: 'number',
      description: 'Lower numbers appear first.', initialValue: 100,
    }),
  ],
  orderings: [{ title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', store: 'store.name', code: 'code', type: 'type', expires: 'expiresAt', media: 'store.logo' },
    prepare: ({ title, store, code, type, expires, media }) => {
      const expired = expires && new Date(expires) < new Date();
      return {
        title: `${expired ? '⛔ ' : ''}${title}`,
        subtitle: [store, type === 'code' ? code : 'Deal', expired ? 'EXPIRED' : null].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
