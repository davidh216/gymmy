import { create } from 'zustand';

/**
 * Hands exercises picked in the exercise picker back to whichever screen asked for them
 * (the plan builder), instead of adding them to the active workout.
 */
export const usePicked = create<{
  /** Who asked, so a stale pick never lands in the wrong place. */
  target: string | null;
  ids: string[] | null;
  request: (target: string) => void;
  deliver: (ids: string[]) => void;
  take: (target: string) => string[] | null;
}>()((set, get) => ({
  target: null,
  ids: null,
  request: (target) => set({ target, ids: null }),
  deliver: (ids) => set({ ids }),
  take: (target) => {
    const { target: t, ids } = get();
    if (t !== target || !ids) return null;
    set({ target: null, ids: null });
    return ids;
  },
}));
