export type NutrientKey = 'fibre' | 'protein' | 'sugar' | 'saturatedFat';
export type Target = { id: string; key: NutrientKey; label: string; value: number; kind: 'min' | 'max'; unit: 'g' };
export type Food = { id: string; name: string; serving: string; nutrients: Record<NutrientKey, number>; source: string };
export type Portion = { foodId: string; amount: number };
export type Meal = { id: string; name: string; day: number; portions: Portion[] };
export type Plan = { targets: Target[]; foods: Food[]; meals: Meal[]; updatedAt: string };
export const TARGET_LIMIT = 5;
export const NUTRIENT_DECIMAL_PLACES = 3;
/**
 * These are deliberately generous operational limits, not dietary advice.
 * They make every accepted multiplication and weekly aggregation safe to
 * store, compare, and announce. A person cannot accidentally enter a number
 * that turns the planner's core answer into Infinity.
 */
export const MAX_NUTRIENT_PER_SERVING = 100_000;
export const MAX_PORTION_AMOUNT = 10_000;
export const MAX_NUTRIENT_TOTAL = 1_000_000;

export const nutrientLabels: Record<NutrientKey, string> = { fibre: 'Fibre', protein: 'Protein', sugar: 'Sugar', saturatedFat: 'Saturated fat' };
export const blankPlan = (): Plan => ({ targets: [], foods: [], meals: [], updatedAt: new Date().toISOString() });
const uid = () => Math.random().toString(36).slice(2, 9);
const nutrientKeys: NutrientKey[] = ['fibre', 'protein', 'sugar', 'saturatedFat'];
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
/**
 * Required text is stored in its trimmed form. Keep this rule shared by the
 * form submitters and the storage validator so a value accepted by the UI can
 * always be read back safely after a reload.
 */
export function normalizeRequiredText(value: unknown, max: number): string | null {
  if (typeof value !== 'string' || value.length > max) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
const isText = (value: unknown, max: number) => normalizeRequiredText(value, max) !== null;
/** IDs are rendered into DOM attributes. Keep their grammar deliberately narrow. */
const isId = (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);
const isNumber = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const isNutrientValue = (value: unknown) => isNumber(value, 0, MAX_NUTRIENT_PER_SERVING);
const isPortionAmount = (value: unknown) => isNumber(value, 0, MAX_PORTION_AMOUNT);
const isTargetValue = (value: unknown) => isNumber(value, 0.1, MAX_NUTRIENT_TOTAL);
const isSafeCalculatedTotal = (value: number) => Number.isFinite(value) && value >= 0 && value <= MAX_NUTRIENT_TOTAL;
const isFood = (food: unknown) => {
  if (!isRecord(food) || !isId(food.id) || !isText(food.name, 60) || !isText(food.serving, 40) || !isText(food.source, 80)) return false;
  const nutrients = food.nutrients;
  return isRecord(nutrients) && nutrientKeys.every(key => isNutrientValue(nutrients[key]));
};

function calculatedTotals(portions: Portion[], foods: Food[]): Record<NutrientKey, number> | null {
  const total: Record<NutrientKey, number> = { fibre: 0, protein: 0, sugar: 0, saturatedFat: 0 };
  for (const portion of portions) {
    const food = foods.find(candidate => candidate.id === portion.foodId);
    if (!food || !isPortionAmount(portion.amount)) return null;
    for (const key of nutrientKeys) {
      const contribution = food.nutrients[key] * portion.amount;
      const next = total[key] + contribution;
      if (!isSafeCalculatedTotal(contribution) || !isSafeCalculatedTotal(next)) return null;
      total[key] = next;
    }
  }
  for (const key of nutrientKeys) {
    total[key] = nutrientValue(total[key]);
    if (!isSafeCalculatedTotal(total[key])) return null;
  }
  return total;
}

function planHasSafeCalculatedTotals(plan: Pick<Plan, 'foods' | 'meals'>) {
  return calculatedTotals(plan.meals.flatMap(meal => meal.portions), plan.foods) !== null &&
    plan.meals.every(meal => calculatedTotals(meal.portions, plan.foods) !== null);
}

/** Accept only complete, safe plan records before they reach persistent storage. */
export function isPlan(value: unknown): value is Plan {
  if (!isRecord(value) || !Array.isArray(value.targets) || !Array.isArray(value.foods) || !Array.isArray(value.meals) || typeof value.updatedAt !== 'string' || value.targets.length > TARGET_LIMIT) return false;
  const foods = value.foods;
  if (!foods.every(isFood)) return false;
  if (!value.targets.every(target => isRecord(target) && isId(target.id) && isText(target.label, 45) && nutrientKeys.includes(target.key as NutrientKey) && (target.kind === 'min' || target.kind === 'max') && isTargetValue(target.value) && target.unit === 'g')) return false;
  const foodIds = new Set(foods.map(food => (food as Food).id));
  const targetIds = new Set(value.targets.map(target => (target as Target).id));
  if (foodIds.size !== foods.length || targetIds.size !== value.targets.length) return false;
  if (!value.meals.every(meal => isRecord(meal) && isId(meal.id) && isText(meal.name, 60) && Number.isInteger(meal.day) && (meal.day as number) >= 0 && (meal.day as number) < 7 && Array.isArray(meal.portions) && meal.portions.every(portion => isRecord(portion) && isId(portion.foodId) && foodIds.has(portion.foodId as string) && isPortionAmount(portion.amount)))) return false;
  const mealIds = new Set(value.meals.map(meal => (meal as Meal).id));
  return mealIds.size === value.meals.length && planHasSafeCalculatedTotals(value as Plan);
}

export const canSaveTarget = (targetCount: number) => targetCount < TARGET_LIMIT;

/**
 * Food values use 0.1 g steps and portions use 0.25 steps, so supported
 * calculations can produce thousandths of a gram. Normalize once at that
 * precision before values are compared or presented.
 */
export const nutrientValue = (value: number) => Number.isFinite(value) ? Number(value.toFixed(NUTRIENT_DECIMAL_PLACES)) : Number.NaN;
export const formatNutrient = (value: number) => Number.isFinite(value) ? nutrientValue(value).toString() : '—';

export const samplePlan = (): Plan => ({
  targets: [
    { id: 'fibre', key: 'fibre', label: 'Fibre floor', value: 30, kind: 'min', unit: 'g' },
    { id: 'protein', key: 'protein', label: 'Protein floor', value: 75, kind: 'min', unit: 'g' },
    { id: 'sugar', key: 'sugar', label: 'Total sugar limit', value: 36, kind: 'max', unit: 'g' }
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
  return calculatedTotals(portions, foods) || { fibre: Number.NaN, protein: Number.NaN, sugar: Number.NaN, saturatedFat: Number.NaN };
}
export function coverage(plan: Plan) { return totals(plan.meals.flatMap(m => m.portions), plan.foods); }
export function status(target: Target, actual: number) {
  const calculationValid = isTargetValue(target.value) && isSafeCalculatedTotal(actual);
  if (!calculationValid) return { actual: Number.NaN, target: Number.NaN, passes: false, difference: Number.NaN, ratio: 0, calculationValid: false };
  const comparedActual = nutrientValue(actual);
  const comparedTarget = nutrientValue(target.value);
  const passes = target.kind === 'min' ? comparedActual >= comparedTarget : comparedActual <= comparedTarget;
  return {
    actual: comparedActual,
    target: comparedTarget,
    passes,
    difference: nutrientValue(Math.abs(comparedActual - comparedTarget)),
    ratio: target.kind === 'min'
      ? Math.min(comparedActual / comparedTarget, 1)
      : Math.min(comparedTarget / Math.max(comparedActual, 0.001), 1),
    calculationValid: true
  };
}
export const makeId = uid;
