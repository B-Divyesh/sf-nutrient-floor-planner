export type NutrientKey = 'fibre' | 'protein' | 'sugar' | 'saturatedFat';
export type Target = { id: string; key: NutrientKey; label: string; value: number; kind: 'min' | 'max'; unit: 'g' };
export type Food = { id: string; name: string; serving: string; nutrients: Record<NutrientKey, number>; source: string };
export type Portion = { foodId: string; amount: number };
export type Meal = { id: string; name: string; day: number; portions: Portion[] };
export type Plan = { targets: Target[]; foods: Food[]; meals: Meal[]; updatedAt: string };

export const nutrientLabels: Record<NutrientKey, string> = { fibre: 'Fibre', protein: 'Protein', sugar: 'Sugar', saturatedFat: 'Saturated fat' };
export const blankPlan = (): Plan => ({ targets: [], foods: [], meals: [], updatedAt: new Date().toISOString() });
const uid = () => Math.random().toString(36).slice(2, 9);

export const samplePlan = (): Plan => ({
  targets: [
    { id: 'fibre', key: 'fibre', label: 'Fibre floor', value: 30, kind: 'min', unit: 'g' },
    { id: 'protein', key: 'protein', label: 'Protein floor', value: 75, kind: 'min', unit: 'g' },
    { id: 'sugar', key: 'sugar', label: 'Added sugar limit', value: 36, kind: 'max', unit: 'g' }
  ],
  foods: [
    { id: 'oats', name: 'Rolled oats', serving: '½ cup dry', nutrients: { fibre: 4, protein: 5, sugar: 1, saturatedFat: 0.5 }, source: 'Label, packet at home' },
    { id: 'yogurt', name: 'Plain Greek yogurt', serving: '¾ cup', nutrients: { fibre: 0, protein: 17, sugar: 6, saturatedFat: 0 }, source: 'Label, tub at home' },
    { id: 'berries', name: 'Frozen blueberries', serving: '1 cup', nutrients: { fibre: 4, protein: 1, sugar: 15, saturatedFat: 0 }, source: 'USDA FoodData Central' },
    { id: 'lentils', name: 'Cooked lentils', serving: '1 cup', nutrients: { fibre: 16, protein: 18, sugar: 4, saturatedFat: 0.1 }, source: 'USDA FoodData Central' },
    { id: 'tofu', name: 'Firm tofu', serving: '150 g', nutrients: { fibre: 2, protein: 18, sugar: 1, saturatedFat: 1.2 }, source: 'Label, packet at home' },
    { id: 'spinach', name: 'Spinach', serving: '2 cups', nutrients: { fibre: 1.5, protein: 2, sugar: 0.2, saturatedFat: 0 }, source: 'USDA FoodData Central' },
    { id: 'chickpeas', name: 'Cooked chickpeas', serving: '1 cup', nutrients: { fibre: 12.5, protein: 14.5, sugar: 7.9, saturatedFat: 0.4 }, source: 'USDA FoodData Central' }
  ],
  meals: [
    { id: 'breakfast', name: 'Oats, yogurt and berries', day: 0, portions: [{ foodId: 'oats', amount: 1 }, { foodId: 'yogurt', amount: 1 }, { foodId: 'berries', amount: 1 }] },
    { id: 'lunch', name: 'Lentil and spinach bowl', day: 1, portions: [{ foodId: 'lentils', amount: 1 }, { foodId: 'spinach', amount: 1 }] },
    { id: 'dinner', name: 'Tofu chickpea skillet', day: 2, portions: [{ foodId: 'tofu', amount: 1 }, { foodId: 'chickpeas', amount: 1 }] }
  ], updatedAt: new Date().toISOString()
});

export function totals(portions: Portion[], foods: Food[]): Record<NutrientKey, number> {
  const total: Record<NutrientKey, number> = { fibre: 0, protein: 0, sugar: 0, saturatedFat: 0 };
  for (const p of portions) { const food = foods.find(f => f.id === p.foodId); if (food) for (const key of Object.keys(total) as NutrientKey[]) total[key] += food.nutrients[key] * p.amount; }
  return total;
}
export function coverage(plan: Plan) { return totals(plan.meals.flatMap(m => m.portions), plan.foods); }
export function status(target: Target, actual: number) { const passes = target.kind === 'min' ? actual >= target.value : actual <= target.value; return { passes, difference: Math.abs(actual - target.value), ratio: target.kind === 'min' ? Math.min(actual / target.value, 1) : Math.min(target.value / Math.max(actual, 0.01), 1) }; }
export const makeId = uid;
