export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Companion = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  title: string;
  /** Two-stop gradient behind the companion. */
  colors: [string, string];
  /** Things this companion says on the home screen. */
  lines: string[];
};

export const RARITY: Record<Rarity, { label: string; color: string; xpBonus: number }> = {
  common: { label: 'Common', color: '#A1A1AA', xpBonus: 0 },
  rare: { label: 'Rare', color: '#38BDF8', xpBonus: 0.05 },
  epic: { label: 'Epic', color: '#C084FC', xpBonus: 0.1 },
  legendary: { label: 'Legendary', color: '#FBBF24', xpBonus: 0.2 },
};

export const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];

export const COMPANIONS: Companion[] = [
  {
    id: 'sprout',
    name: 'Sprout',
    emoji: '🌱',
    rarity: 'common',
    title: 'The Late Bloomer',
    colors: ['#14532D', '#22C55E'],
    lines: ['Small reps, big roots.', 'Water me with volume.'],
  },
  {
    id: 'pip',
    name: 'Pip',
    emoji: '🐣',
    rarity: 'common',
    title: 'Freshly Hatched',
    colors: ['#78350F', '#FACC15'],
    lines: ['Is this the gym? It smells like chalk!', 'Peep peep. Leg day?'],
  },
  {
    id: 'mochi',
    name: 'Mochi',
    emoji: '🐹',
    rarity: 'common',
    title: 'Wheel Enthusiast',
    colors: ['#7C2D12', '#FB923C'],
    lines: ['I ran 40 miles last night. In place.', 'Cardio is my love language.'],
  },
  {
    id: 'bun',
    name: 'Bun',
    emoji: '🐰',
    rarity: 'common',
    title: 'Box Jump Prodigy',
    colors: ['#831843', '#F472B6'],
    lines: ['Hop to it!', 'Calves of steel, heart of gold.'],
  },
  {
    id: 'kong',
    name: 'Kong',
    emoji: '🦍',
    rarity: 'rare',
    title: 'Strength Seeker',
    colors: ['#3F3F46', '#EF4444'],
    lines: ['Heavy is a feeling. Lift anyway.', 'Add a plate. Trust me.'],
  },
  {
    id: 'blaze',
    name: 'Blaze',
    emoji: '🦊',
    rarity: 'rare',
    title: 'Calorie Crusher',
    colors: ['#7F1D1D', '#F97316'],
    lines: ['Sweat is just fat crying.', "Let's turn up the heat."],
  },
  {
    id: 'steady',
    name: 'Steady',
    emoji: '🐢',
    rarity: 'rare',
    title: 'Habit Builder',
    colors: ['#064E3B', '#2DD4BF'],
    lines: ['Slow is smooth. Smooth is forever.', 'Show up. That is the whole trick.'],
  },
  {
    id: 'zen',
    name: 'Zen',
    emoji: '🐼',
    rarity: 'rare',
    title: 'Wellness Seeker',
    colors: ['#1E1B4B', '#818CF8'],
    lines: ['Breathe in. Brace. Lift.', 'Rest days are training too.'],
  },
  {
    id: 'hoot',
    name: 'Hoot',
    emoji: '🦉',
    rarity: 'rare',
    title: 'Dawn Patrol',
    colors: ['#1C1917', '#A8A29E'],
    lines: ['5am club, reporting for duty.', 'Wise owls warm up.'],
  },
  {
    id: 'rex',
    name: 'Rex',
    emoji: '🦖',
    rarity: 'epic',
    title: 'Prehistoric Powerhouse',
    colors: ['#052E16', '#84CC16'],
    lines: ['Tiny arms. Enormous deadlift.', 'RAWR means "one more set".'],
  },
  {
    id: 'orca',
    name: 'Orca',
    emoji: '🐋',
    rarity: 'epic',
    title: 'Deep Endurance',
    colors: ['#0C4A6E', '#06B6D4'],
    lines: ['The ocean has no finish line.', 'Big engine. Long session.'],
  },
  {
    id: 'talon',
    name: 'Talon',
    emoji: '🦅',
    rarity: 'epic',
    title: 'Apex Athlete',
    colors: ['#422006', '#EAB308'],
    lines: ['Eyes on the bar. Always.', 'Soar through your top set.'],
  },
  {
    id: 'kaiju',
    name: 'Kaiju',
    emoji: '🐉',
    rarity: 'legendary',
    title: 'Mythic Titan',
    colors: ['#450A0A', '#DC2626'],
    lines: ['The city trembles when you squat.', 'We were born for PR day.'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🦄',
    rarity: 'legendary',
    title: 'Radiant Legend',
    colors: ['#4C1D95', '#EC4899'],
    lines: ['You glow different after a workout.', 'Legends are built one rep at a time.'],
  },
];

/** The four companions you choose between during onboarding. */
export const STARTER_IDS = ['kong', 'blaze', 'steady', 'zen'] as const;

const BY_ID = new Map(COMPANIONS.map((c) => [c.id, c]));

export function getCompanion(id: string): Companion {
  return BY_ID.get(id) ?? COMPANIONS[0];
}

export const MAX_STARS = 5;

/** XP bonus the active companion grants, from rarity plus duplicate stars. */
export function companionXpBonus(companion: Companion, stars: number): number {
  return RARITY[companion.rarity].xpBonus + 0.02 * Math.max(0, stars - 1);
}

export type Mood = { label: string; emoji: string };

export function companionMood(daysSinceLastWorkout: number | null): Mood {
  if (daysSinceLastWorkout === null) return { label: 'Ready to roll', emoji: '✨' };
  if (daysSinceLastWorkout <= 1) return { label: 'Pumped', emoji: '🔥' };
  if (daysSinceLastWorkout <= 3) return { label: 'Ready', emoji: '💪' };
  if (daysSinceLastWorkout <= 6) return { label: 'Restless', emoji: '😤' };
  return { label: 'Missing you', emoji: '🥺' };
}
