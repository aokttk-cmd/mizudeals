import { defineField, defineType } from 'sanity';
import { categories, brandColors, hexColor } from './categories.js';

export const store = defineType({
  name: 'store',
  title: 'Store',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Store name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug',
      description: 'Used in links. Click “Generate”.',
      options: { source: 'name', maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category', title: 'Category', type: 'string',
      options: { list: categories }, validation: (r) => r.required(),
    }),
    defineField({
      name: 'color', title: 'Card colour', type: 'string',
      description: 'Pick a brand colour or type a hex value like #ff7a00.',
      options: { list: brandColors }, initialValue: '#2b8cff', validation: hexColor,
    }),
    defineField({
      name: 'logo', title: 'Logo', type: 'image',
      description: 'Optional. Square PNG/SVG works best. Initials are shown if empty.',
    }),
    defineField({ name: 'website', title: 'Store website / affiliate link', type: 'url' }),
    defineField({
      name: 'featured', title: 'Show in “Popular stores”', type: 'boolean', initialValue: true,
    }),
    defineField({
      name: 'order', title: 'Sort order', type: 'number',
      description: 'Lower numbers appear first.', initialValue: 100,
    }),
  ],
  orderings: [{ title: 'Sort order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'category', media: 'logo' },
  },
});
