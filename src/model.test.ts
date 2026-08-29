import { describe, expect, it } from 'vitest';
import { MAX_NUTRIENT_PER_SERVING, MAX_PORTION_AMOUNT, MAX_NUTRIENT_TOTAL, TARGET_LIMIT, canSaveTarget, coverage, formatNutrient, isPlan, normalizeRequiredText, samplePlan, status, totals } from './model';
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
  it('rejects numeric values beyond the supported range before storage', () => {
    const plan = samplePlan();
    plan.foods[0].nutrients.fibre = MAX_NUTRIENT_PER_SERVING + 0.1;
    expect(isPlan(plan)).toBe(false);
    plan.foods[0].nutrients.fibre = 4;
    plan.targets[0].value = MAX_NUTRIENT_TOTAL + 0.1;
    expect(isPlan(plan)).toBe(false);
    plan.targets[0].value = 30;
    plan.meals[0].portions[0].amount = MAX_PORTION_AMOUNT + 0.25;
    expect(isPlan(plan)).toBe(false);
  });
  it('rejects finite records whose multiplication would exceed the safe weekly total', () => {
    const plan = {
      targets: [{ id: 'fibre-floor', key: 'fibre', label: 'Fibre floor', value: 30, kind: 'min', unit: 'g' }],
      foods: [{ id: 'large-food', name: 'Large food', serving: '1 serving', source: 'Test label', nutrients: { fibre: MAX_NUTRIENT_PER_SERVING, protein: 0, sugar: 0, saturatedFat: 0 } }],
      meals: [{ id: 'large-meal', name: 'Large meal', day: 0, portions: [{ foodId: 'large-food', amount: 11 }] }],
      updatedAt: new Date().toISOString()
    };
    expect(MAX_NUTRIENT_PER_SERVING * 11).toBeGreaterThan(MAX_NUTRIENT_TOTAL);
    expect(isPlan(plan)).toBe(false);
    expect(totals(plan.meals[0].portions, plan.foods).fibre).toBeNaN();
  });
  it('never turns an unsafe total into an on-plan status or an Infinity display', () => {
    const target = samplePlan().targets[0];
    expect(status(target, Number.POSITIVE_INFINITY)).toMatchObject({ passes: false, calculationValid: false, ratio: 0 });
    expect(formatNutrient(Number.POSITIVE_INFINITY)).toBe('—');
  });
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
