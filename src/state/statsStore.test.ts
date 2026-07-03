import { isStatsTickerRunning, startStatsTicker, stopStatsTicker, useStatsStore } from './statsStore';

function resetStore() {
  useStatsStore.setState({ liveStats: {}, visibleIds: [] });
  stopStatsTicker();
}

describe('statsStore', () => {
  afterEach(resetStore);

  it('registers base stats once, seeding hp/attack from the base values', () => {
    useStatsStore.getState().registerBaseStats(25, { hp: 35, attack: 55 });
    expect(useStatsStore.getState().liveStats[25]).toEqual({
      baseHp: 35,
      baseAttack: 55,
      hp: 35,
      attack: 55,
    });
  });

  it('does not overwrite already-registered base stats', () => {
    useStatsStore.getState().registerBaseStats(25, { hp: 35, attack: 55 });
    useStatsStore.getState().registerBaseStats(25, { hp: 999, attack: 999 });
    expect(useStatsStore.getState().liveStats[25]?.baseHp).toBe(35);
  });

  it('tick only mutates currently visible ids, leaving others referentially unchanged', () => {
    useStatsStore.getState().registerBaseStats(1, { hp: 45, attack: 49 });
    useStatsStore.getState().registerBaseStats(2, { hp: 60, attack: 62 });
    useStatsStore.getState().setVisibleIds([1]);

    const beforeId2 = useStatsStore.getState().liveStats[2];

    useStatsStore.getState().tick();

    const afterState = useStatsStore.getState();
    // Off-screen id keeps the exact same object reference -> selectors bail out, no re-render.
    expect(afterState.liveStats[2]).toBe(beforeId2);
    // Visible id gets a new object reference (even if the jittered value could coincide).
    expect(afterState.liveStats[1]).not.toBe(
      // the very first registered object for id 1
      { baseHp: 45, baseAttack: 49, hp: 45, attack: 49 },
    );
  });

  it('tick is a no-op when there are no visible ids', () => {
    useStatsStore.getState().registerBaseStats(1, { hp: 45, attack: 49 });
    const before = useStatsStore.getState().liveStats;
    useStatsStore.getState().tick();
    expect(useStatsStore.getState().liveStats).toBe(before);
  });

  it('starts and stops the ticker idempotently', () => {
    jest.useFakeTimers();
    expect(isStatsTickerRunning()).toBe(false);

    startStatsTicker(500);
    startStatsTicker(500); // second call must be a no-op
    expect(isStatsTickerRunning()).toBe(true);

    stopStatsTicker();
    expect(isStatsTickerRunning()).toBe(false);
    jest.useRealTimers();
  });
});
