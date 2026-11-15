import { defineField, defineType } from 'sanity';
import { categories, brandColors, hexColor } from './categories.js';

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required().max(90) }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'tag', title: 'Tag', type: 'string', options: { list: categories }, validation: (r) => r.required() }),
    defineField({
      name: 'color', title: 'Card colour', type: 'string', options: { list: brandColors },
      initialValue: '#8a2be2', validation: hexColor,
    }),
    defineField({ name: 'publishedAt', title: 'Published', type: 'date', initialValue: () => new Date().toISOString().slice(0, 10) }),
    defineField({ name: 'excerpt', title: 'Short summary', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Article', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'tag' } },
});
