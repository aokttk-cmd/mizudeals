// Sample data — fictional stores and offers. Replace with a real API/CMS later.
export const stores = [
  { id: 'kumo', name: 'Kumo Audio', cat: 'Electronics', color: '#2ec5f5', coupons: 14 },
  { id: 'northpeak', name: 'Northpeak', cat: 'Outdoor', color: '#ff7a00', coupons: 9 },
  { id: 'lumen', name: 'Lumen Skin', cat: 'Beauty', color: '#ffc414', coupons: 21 },
  { id: 'pixelforge', name: 'Pixel Forge', cat: 'Electronics', color: '#8a2be2', coupons: 7 },
  { id: 'tidewear', name: 'Tidewear', cat: 'Fashion', color: '#2b8cff', coupons: 18 },
  { id: 'hearth', name: 'Hearth & Co', cat: 'Home', color: '#ff5e3a', coupons: 11 },
  { id: 'velo', name: 'Velo Cycles', cat: 'Outdoor', color: '#5fe3ff', coupons: 6 },
  { id: 'brewline', name: 'Brewline', cat: 'Food', color: '#ffe600', coupons: 12 },
  { id: 'orbit', name: 'Orbit Travel', cat: 'Travel', color: '#9bd92c', coupons: 10 },
  { id: 'saku', name: 'Saku Home', cat: 'Home', color: '#e04de8', coupons: 15 },
  { id: 'nova', name: 'Nova Fit', cat: 'Fitness', color: '#b5dc16', coupons: 16 },
  { id: 'petal', name: 'Petal Florals', cat: 'Gifts', color: '#a64dff', coupons: 8 },
];

export const coupons = [
  { store: 'tidewear', title: '20% off your first order', type: 'code', code: 'FLOW20', used: 1524, cat: 'Fashion' },
  { store: 'kumo', title: '$30 off headphones over $150', type: 'code', code: 'KUMO30', used: 961, cat: 'Electronics' },
  { store: 'lumen', title: 'Buy 2, get 1 free on serums', type: 'deal', used: 1261, cat: 'Beauty' },
  { store: 'orbit', title: '10% off hotel bookings', type: 'code', code: 'DRIFT10', used: 888, cat: 'Travel' },
  { store: 'velo', title: 'Up to $400 off e-bikes', type: 'deal', used: 850, cat: 'Outdoor' },
  { store: 'nova', title: '$15 off + free shipping', type: 'code', code: 'NOVA15', used: 736, cat: 'Fitness' },
  { store: 'brewline', title: 'First bag of beans free', type: 'code', code: 'FIRSTPOUR', used: 731, cat: 'Food' },
  { store: 'saku', title: '25% off bedding sets', type: 'code', code: 'SLEEPWELL', used: 602, cat: 'Home' },
  { store: 'pixelforge', title: '12% off 3D printers', type: 'code', code: 'FORGE12', used: 540, cat: 'Electronics' },
  { store: 'petal', title: 'Free delivery on bouquets', type: 'deal', used: 498, cat: 'Gifts' },
];

export const guides = [
  { tag: 'Electronics', title: 'How to time your tech upgrades around sale cycles', date: 'Nov 12, 2026', hue: '#8a2be2' },
  { tag: 'Home', title: 'The calm-home checklist: what to buy, what to skip', date: 'Nov 8, 2026', hue: '#ff7a00' },
  { tag: 'Travel', title: 'Stacking codes and cashback on your next trip', date: 'Nov 3, 2026', hue: '#2b8cff' },
  { tag: 'Beauty', title: 'Skincare value sets that are actually worth it', date: 'Oct 28, 2026', hue: '#ffc414' },
  { tag: 'Fitness', title: 'Building a home gym for under $500', date: 'Oct 21, 2026', hue: '#9bd92c' },
];

export const faqs = [
  { q: 'What are coupon codes?', a: 'Short strings of letters and numbers you enter at checkout to unlock a discount, free shipping or a gift with purchase.' },
  { q: 'Are the codes on Mizu Deals verified?', a: 'Every code is checked by our team and re-tested regularly. Expired offers drift out automatically, so what you see is what works.' },
  { q: 'Does it cost anything to use?', a: 'Never. Mizu Deals is free. We may earn a small commission from partner stores, which never changes your price.' },
  { q: 'How do I use a deal without a code?', a: 'Tap “Get deal” and we’ll take you to the store with the discount already applied — no typing needed.' },
];
