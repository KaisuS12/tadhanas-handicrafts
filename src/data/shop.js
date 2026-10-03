// ============================================================
//  FALLBACK DATA
//  Used when Supabase isn't set up yet (see README).
//  Once Supabase is connected, the owner edits everything
//  in the admin page (#/admin) instead of this file.
//  The shape here matches the database tables.
// ============================================================

export const settings = {
  name: "Tadhana's Handicrafts",
  tagline: 'Handmade bouquets for every kind of story.',
  messenger_username: 'tadhanashandicrafts',
  facebook_url: 'https://facebook.com/tadhanashandicrafts',
  phone: '0917 000 0000',
  location: 'Quezon City, Metro Manila',
  hours: 'Mon–Sat, 9AM–7PM',
}

// recipe = what's inside, so customers can "Make one like this"
export const bouquets = [
  {
    id: 'classic-red', code: 'B001', name: 'Classic Red Dozen', category: 'Anniversary', emoji: '🌹', image_url: '', sort: 1, active: true,
    description: 'A dozen red roses with baby’s breath. Timeless.',
    wrapper_id: 'korean',
    recipe: [{ flower_id: 'rose', color: 'Red', qty: 12 }, { flower_id: 'babys-breath', color: 'White', qty: 4 }],
  },
  {
    id: 'sunny-day', code: 'B002', name: 'Sunny Day', category: 'Graduation', emoji: '🌻', image_url: '', sort: 2, active: true,
    description: 'Bright sunflowers with eucalyptus for the big day.',
    wrapper_id: 'kraft',
    recipe: [{ flower_id: 'sunflower', color: 'Yellow', qty: 3 }, { flower_id: 'eucalyptus', color: 'Green', qty: 3 }],
  },
  {
    id: 'blush-tulips', code: 'B003', name: 'Blush Tulips', category: 'Birthday', emoji: '🌷', image_url: '', sort: 3, active: true,
    description: 'Soft pink tulips, simple and sweet.',
    wrapper_id: 'korean',
    recipe: [{ flower_id: 'tulip', color: 'Pink', qty: 10 }, { flower_id: 'fern', color: 'Green', qty: 3 }],
  },
  {
    id: 'mini-love', code: 'B004', name: 'Mini Love', category: 'Just Because', emoji: '💐', image_url: '', sort: 4, active: true,
    description: 'Small but sweet. Perfect for “just because”.',
    wrapper_id: 'kraft',
    recipe: [{ flower_id: 'rose', color: 'Pink', qty: 3 }, { flower_id: 'babys-breath', color: 'White', qty: 2 }],
  },
  {
    id: 'white-peace', code: 'B005', name: 'White Peace', category: 'Sympathy', emoji: '🤍', image_url: '', sort: 5, active: true,
    description: 'Calm white lilies and greens in a basket.',
    wrapper_id: 'basket',
    recipe: [{ flower_id: 'lily', color: 'White', qty: 6 }, { flower_id: 'eucalyptus', color: 'Green', qty: 5 }],
  },
  {
    id: 'pastel-dream', code: 'B006', name: 'Pastel Dream', category: 'Birthday', emoji: '🌸', image_url: '', sort: 6, active: true,
    description: 'Mixed pastel roses and carnations with statice.',
    wrapper_id: 'korean',
    recipe: [
      { flower_id: 'rose', color: 'Peach', qty: 5 },
      { flower_id: 'carnation', color: 'Pink', qty: 4 },
      { flower_id: 'statice', color: 'Purple', qty: 3 },
    ],
  },
]

// type: 'main' = the star flowers, 'filler' = greens and small fillers
export const flowers = [
  { id: 'rose', name: 'Rose', type: 'main', colors: ['Red', 'Pink', 'White', 'Yellow', 'Peach'], image_url: '', emoji: '🌹', sort: 1, active: true },
  { id: 'tulip', name: 'Tulip', type: 'main', colors: ['Pink', 'White', 'Yellow', 'Purple'], image_url: '', emoji: '🌷', sort: 2, active: true },
  { id: 'sunflower', name: 'Sunflower', type: 'main', colors: ['Yellow'], image_url: '', emoji: '🌻', sort: 3, active: true },
  { id: 'carnation', name: 'Carnation', type: 'main', colors: ['Red', 'Pink', 'White'], image_url: '', emoji: '🌺', sort: 4, active: true },
  { id: 'lily', name: 'Lily', type: 'main', colors: ['White', 'Pink'], image_url: '', emoji: '🪷', sort: 5, active: true },
  { id: 'babys-breath', name: 'Baby’s Breath', type: 'filler', colors: ['White'], image_url: '', emoji: '☁️', sort: 6, active: true },
  { id: 'eucalyptus', name: 'Eucalyptus', type: 'filler', colors: ['Green'], image_url: '', emoji: '🌿', sort: 7, active: true },
  { id: 'statice', name: 'Statice', type: 'filler', colors: ['Purple', 'White'], image_url: '', emoji: '🪻', sort: 8, active: true },
  { id: 'fern', name: 'Fern Leaves', type: 'filler', colors: ['Green'], image_url: '', emoji: '🍃', sort: 9, active: true },
]

// kind: 'wrapper' (customer picks one) or 'addon' (customer picks any)
export const options = [
  { id: 'kraft', kind: 'wrapper', name: 'Kraft Paper', sort: 1 },
  { id: 'korean', kind: 'wrapper', name: 'Korean Wrap', sort: 2 },
  { id: 'box', kind: 'wrapper', name: 'Flower Box', sort: 3 },
  { id: 'basket', kind: 'wrapper', name: 'Basket', sort: 4 },
  { id: 'card', kind: 'addon', name: 'Message Card', sort: 5 },
  { id: 'ribbon', kind: 'addon', name: 'Satin Ribbon', sort: 6 },
  { id: 'chocolate', kind: 'addon', name: 'Chocolates', sort: 7 },
]
