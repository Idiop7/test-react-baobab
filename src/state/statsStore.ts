import { create } from 'zustand';

export interface LiveStats {
  baseHp: number;
  baseAttack: number;
  hp: number;
  attack: number;
}

interface StatsStoreState {
  liveStats: Record<number, LiveStats>;
  visibleIds: number[];
  registerBaseStats: (id: number, base: { hp: number; attack: number }) => void;
  setVisibleIds: (ids: number[]) => void;
  tick: () => void;
}

const TICK_JITTER_RATIO = 0.12;

function jitter(base: number): number {
  const delta = base * TICK_JITTER_RATIO;
  const next = base + (Math.random() * 2 - 1) * delta;
  return Math.max(1, Math.round(next));
}

export const useStatsStore = create<StatsStoreState>((set, get) => ({
  liveStats: {},
  visibleIds: [],

  registerBaseStats: (id, base) => {
    if (get().liveStats[id]) return;
    set((state) => ({
      liveStats: {
        ...state.liveStats,
        [id]: { baseHp: base.hp, baseAttack: base.attack, hp: base.hp, attack: base.attack },
      },
    }));
  },

  setVisibleIds: (ids) => set({ visibleIds: ids }),

  // Only the sub-objects for currently visible ids get a new reference:
  // off-screen cells keep the exact same object, so their `useStatsStore(s => s.liveStats[id])`
  // selector bails out and they never re-render.
  tick: () => {
    const { visibleIds, liveStats } = get();
    if (visibleIds.length === 0) return;

    let changed = false;
    const next: Record<number, LiveStats> = { ...liveStats };
    for (const id of visibleIds) {
      const current = next[id];
      if (!current) continue;
      next[id] = {
        ...current,
        hp: jitter(current.baseHp),
        attack: jitter(current.baseAttack),
      };
      changed = true;
    }

    if (changed) set({ liveStats: next });
  },
}));

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startStatsTicker(intervalMs = 500): void {
  if (intervalId !== null) return;
  intervalId = setInterval(() => useStatsStore.getState().tick(), intervalMs);
}

export function stopStatsTicker(): void {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function isStatsTickerRunning(): boolean {
  return intervalId !== null;
}
