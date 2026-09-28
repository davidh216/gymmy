import { COMPANIONS, type Rarity } from './companions';

export const RATES: Record<Rarity, number> = {
  legendary: 0.015,
  epic: 0.085,
  rare: 0.3,
  common: 0.6,
};

/** Every 10th pull without an epic or better is guaranteed epic+. */
export const EPIC_PITY = 10;
/** Every 60th pull without a legendary is guaranteed legendary. */
export const LEGENDARY_PITY = 60;

export type Pity = { sinceEpic: number; sinceLegendary: number };

export const EMPTY_PITY: Pity = { sinceEpic: 0, sinceLegendary: 0 };

export type Rng = () => number;

export function rollRarity(rng: Rng, pity: Pity): Rarity {
  if (pity.sinceLegendary + 1 >= LEGENDARY_PITY) return 'legendary';
  const roll = rng();
  if (roll < RATES.legendary) return 'legendary';
  if (pity.sinceEpic + 1 >= EPIC_PITY) return 'epic';
  if (roll < RATES.legendary + RATES.epic) return 'epic';
  if (roll < RATES.legendary + RATES.epic + RATES.rare) return 'rare';
  return 'common';
}

export function nextPity(pity: Pity, rarity: Rarity): Pity {
  return {
    sinceLegendary: rarity === 'legendary' ? 0 : pity.sinceLegendary + 1,
    sinceEpic: rarity === 'legendary' || rarity === 'epic' ? 0 : pity.sinceEpic + 1,
  };
}

export function summon(count: number, pity: Pity, rng: Rng = Math.random) {
  const ids: string[] = [];
  let current = pity;
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(rng, current);
    const pool = COMPANIONS.filter((c) => c.rarity === rarity);
    ids.push(pool[Math.floor(rng() * pool.length) % pool.length].id);
    current = nextPity(current, rarity);
  }
  return { ids, pity: current };
}
