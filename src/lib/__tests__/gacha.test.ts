import { getCompanion } from '../companions';
import { EMPTY_PITY, EPIC_PITY, LEGENDARY_PITY, nextPity, rollRarity, summon } from '../gacha';

const always = (n: number) => () => n;

describe('rollRarity', () => {
  it('maps rolls to rarity bands', () => {
    expect(rollRarity(always(0.01), EMPTY_PITY)).toBe('legendary');
    expect(rollRarity(always(0.05), EMPTY_PITY)).toBe('epic');
    expect(rollRarity(always(0.3), EMPTY_PITY)).toBe('rare');
    expect(rollRarity(always(0.9), EMPTY_PITY)).toBe('common');
  });

  it('guarantees epic+ at the epic pity', () => {
    expect(rollRarity(always(0.9), { sinceEpic: EPIC_PITY - 1, sinceLegendary: 0 })).toBe('epic');
  });

  it('guarantees legendary at the legendary pity', () => {
    expect(rollRarity(always(0.9), { sinceEpic: 0, sinceLegendary: LEGENDARY_PITY - 1 })).toBe('legendary');
  });
});

describe('nextPity', () => {
  it('resets counters on high rarity pulls', () => {
    expect(nextPity({ sinceEpic: 4, sinceLegendary: 20 }, 'epic')).toEqual({ sinceEpic: 0, sinceLegendary: 21 });
    expect(nextPity({ sinceEpic: 4, sinceLegendary: 20 }, 'legendary')).toEqual(EMPTY_PITY);
    expect(nextPity({ sinceEpic: 4, sinceLegendary: 20 }, 'common')).toEqual({ sinceEpic: 5, sinceLegendary: 21 });
  });
});

describe('summon', () => {
  it('always yields an epic+ in a ten pull', () => {
    const { ids, pity } = summon(10, EMPTY_PITY, always(0.99));
    expect(ids).toHaveLength(10);
    expect(getCompanion(ids[9]).rarity).toBe('epic');
    expect(pity.sinceEpic).toBe(0);
  });
});
