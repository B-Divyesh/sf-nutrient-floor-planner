import { describe, expect, it } from 'vitest';
import { coverage, samplePlan, status, totals } from './model';
describe('nutrient math', () => {
  it('adds portions by amount', () => { const p = samplePlan(); expect(totals([{ foodId: 'lentils', amount: 2 }], p.foods).fibre).toBe(32); });
  it('identifies sample fibre coverage', () => { const p = samplePlan(); expect(coverage(p).fibre).toBeGreaterThan(30); });
  it('checks floors and limits', () => { const min = samplePlan().targets[0]; const max = samplePlan().targets[2]; expect(status(min, 31).passes).toBe(true); expect(status(max, 40).passes).toBe(false); });
});
