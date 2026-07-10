export type CosmeticCategory = 'hat' | 'accessory';

export interface CosmeticItem {
  id: string;
  name: string;
  category: CosmeticCategory;
  cost: number;
  description?: string;
}

/**
 * The shop catalog. Artwork for each id lives in components/profile/bee-avatar.tsx
 * (HatLayer / AccessoryLayer) — this file is just the metadata (name/price),
 * kept separate so pricing/catalog changes don't require touching the art.
 */
export const HAT_CATALOG: CosmeticItem[] = [
  { id: 'cap', name: 'Cap', category: 'hat', cost: 20 },
  { id: 'chef-hat', name: 'Chef hat', category: 'hat', cost: 25 },
  { id: 'santa-hat', name: 'Santa hat', category: 'hat', cost: 30 },
  { id: 'viking-helmet', name: 'Viking helmet', category: 'hat', cost: 40 },
  { id: 'mario-cap', name: 'Mario cap', category: 'hat', cost: 50, description: 'Comes with a mustache.' },
  { id: 'luigi-cap', name: 'Luigi cap', category: 'hat', cost: 50, description: 'Comes with a mustache.' },
  { id: 'pirate-hat', name: 'Pirate hat', category: 'hat', cost: 60 }
];

export function findCosmetic(id: string): CosmeticItem | undefined {
  return HAT_CATALOG.find((item) => item.id === id);
}
