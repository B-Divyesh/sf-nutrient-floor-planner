import { describe, expect, it } from 'vitest';
import { TARGET_LIMIT, canSaveTarget, coverage, isPlan, normalizeRequiredText, samplePlan, status, totals } from './model';
describe('nutrient math', () => {
  it('adds portions by amount', () => { const p = samplePlan(); expect(totals([{ foodId: 'lentils', amount: 2 }], p.foods).fibre).toBe(32); });
  it('identifies sample fibre coverage', () => { const p = samplePlan(); expect(coverage(p).fibre).toBeGreaterThan(30); });
  it('checks floors and limits', () => { const min = samplePlan().targets[0]; const max = samplePlan().targets[2]; expect(status(min, 31).passes).toBe(true); expect(status(max, 40).passes).toBe(false); });
  it('keeps maximum comparisons and differences at the supported nutrient precision', () => {
    const maximum = { id: 'sugar-max', key: 'sugar', label: 'Tiny sugar limit', value: 0.1, kind: 'max', unit: 'g' } as const;
    expect(status(maximum, 0.1 * 1.25)).toMatchObject({ passes: false, difference: 0.025 });
  });
  it('keeps minimum comparisons and differences at the supported nutrient precision', () => {
    const minimum = { id: 'fibre-min', key: 'fibre', label: 'Tiny fibre floor', value: 0.1, kind: 'min', unit: 'g' } as const;
    expect(status(minimum, 0.1 * 0.75)).toMatchObject({ passes: false, difference: 0.025 });
  });
  it('rejects incomplete plan records before they can be stored', () => { expect(isPlan({ foods: [{}], targets: [], meals: [], updatedAt: 'x' })).toBe(false); expect(isPlan(samplePlan())).toBe(true); });
  it('normalizes required text once for forms and stored plans', () => {
    expect(normalizeRequiredText('  Fibre floor  ', 45)).toBe('Fibre floor');
    expect(normalizeRequiredText('   ', 45)).toBeNull();
    expect(normalizeRequiredText('x'.repeat(46), 45)).toBeNull();
    const plan = samplePlan();
    plan.foods[0].name = '   ';
    expect(isPlan(plan)).toBe(false);
  });
  it('rejects IDs that could alter rendered HTML attributes', () => {
    const plan = samplePlan();
    plan.foods[0].id = 'x\"><img src="/qa-injected" alt="marker';
    expect(isPlan(plan)).toBe(false);
  });
  it('limits plans to five targets', () => { const plan = samplePlan(); plan.targets = Array.from({ length: TARGET_LIMIT + 1 }, (_, index) => ({ ...plan.targets[0], id: `target-${index}` })); expect(isPlan(plan)).toBe(false); });
  it('applies the target capacity rule outside the UI', () => {
    expect(canSaveTarget(TARGET_LIMIT - 1)).toBe(true);
    expect(canSaveTarget(TARGET_LIMIT)).toBe(false);
  });
});
