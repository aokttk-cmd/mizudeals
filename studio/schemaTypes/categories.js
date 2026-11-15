// Shared category list for stores. Add new categories here.
export const categories = [
  'Electronics', 'Fashion', 'Beauty', 'Home', 'Outdoor', 'Fitness',
  'Food', 'Travel', 'Gifts', 'Department Store', 'Software', 'Kids', 'Pets',
].map((c) => ({ title: c, value: c }));

// Brand colours from the Mizu Deals logo, offered as quick picks.
export const brandColors = [
  { title: 'Cyan', value: '#2ec5f5' },
  { title: 'Blue', value: '#2b8cff' },
  { title: 'Orange', value: '#ff7a00' },
  { title: 'Amber', value: '#ffc414' },
  { title: 'Yellow', value: '#ffe600' },
  { title: 'Coral', value: '#ff5e3a' },
  { title: 'Green', value: '#9bd92c' },
  { title: 'Lime', value: '#b5dc16' },
  { title: 'Purple', value: '#8a2be2' },
  { title: 'Violet', value: '#a64dff' },
  { title: 'Magenta', value: '#e04de8' },
  { title: 'Sky', value: '#5fe3ff' },
];

export const hexColor = (Rule) =>
  Rule.required().regex(/^#[0-9a-fA-F]{6}$/, { name: 'hex colour' }).error('Use a hex colour like #ff7a00');
