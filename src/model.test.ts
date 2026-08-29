import { describe, expect, it } from 'vitest';
import { FREE_FOOD_LIMIT, TARGET_LIMIT, canImportFoods, canSaveFood, canSaveTarget, coverage, isPlan, samplePlan, status, totals } from './model';
describe('nutrient math', () => {
  it('adds portions by amount', () => { const p = samplePlan(); expect(totals([{ foodId: 'lentils', amount: 2 }], p.foods).fibre).toBe(32); });
  it('identifies sample fibre coverage', () => { const p = samplePlan(); expect(coverage(p).fibre).toBeGreaterThan(30); });
  it('checks floors and limits', () => { const min = samplePlan().targets[0]; const max = samplePlan().targets[2]; expect(status(min, 31).passes).toBe(true); expect(status(max, 40).passes).toBe(false); });
  it('rejects incomplete plan records before they can be stored', () => { expect(isPlan({ foods: [{}], targets: [], meals: [], updatedAt: 'x' })).toBe(false); expect(isPlan(samplePlan())).toBe(true); });
  it('rejects IDs that could alter rendered HTML attributes', () => {
    const plan = samplePlan();
    plan.foods[0].id = 'x\"><img src="/qa-injected" alt="marker';
    expect(isPlan(plan)).toBe(false);
  });
  it('limits plans to five targets', () => { const plan = samplePlan(); plan.targets = Array.from({ length: TARGET_LIMIT + 1 }, (_, index) => ({ ...plan.targets[0], id: `target-${index}` })); expect(isPlan(plan)).toBe(false); });
  it('applies food and target capacity rules outside the UI', () => {
    expect(canSaveFood(FREE_FOOD_LIMIT - 1, false)).toBe(true);
    expect(canSaveFood(FREE_FOOD_LIMIT, false)).toBe(false);
    expect(canSaveFood(FREE_FOOD_LIMIT, true)).toBe(true);
    expect(canImportFoods(FREE_FOOD_LIMIT, false)).toBe(true);
    expect(canImportFoods(FREE_FOOD_LIMIT + 1, false)).toBe(false);
    expect(canSaveTarget(TARGET_LIMIT - 1)).toBe(true);
    expect(canSaveTarget(TARGET_LIMIT)).toBe(false);
  });
});
