import './style.css';
import { FREE_FOOD_LIMIT, TARGET_LIMIT, blankPlan, canImportFoods, canSaveFood, canSaveTarget, coverage, isPlan, makeId, nutrientLabels, samplePlan, status, totals, type Food, type NutrientKey, type Plan, type Target } from './model';
import { clearPlan, readPlan, writePlan } from './store';

const app = document.querySelector<HTMLDivElement>('#app')!;
const routeLive = document.querySelector<HTMLDivElement>('#route-live')!;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
type DialogState = { kind: 'food' | 'target' } | { kind: 'meal'; id?: string; day: number } | { kind: 'confirm'; subject: 'food' | 'target' | 'meal'; id: string };

let demo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
let plan: Plan = blankPlan();
let notice = '';
let dialog: DialogState | null = null;
let activeRoute = location.pathname;
let focusRouteHeading = false;
let waitingWorker: ServiceWorker | null = null;
let dialogReturnSelector: string | null = null;
const LICENSE_KEY = 'sb_license:nutrient-floor-planner';
const LICENSE_CHECK_KEY = 'sb_license_check:nutrient-floor-planner';
const LICENSE_MAX_AGE = 24 * 60 * 60 * 1000;
const CANONICAL_ORIGIN = 'https://nutrient-floor-planner.sociobot.in';
let licensed = false;
const foodLimitNotice = `The free planner holds ${FREE_FOOD_LIMIT} foods. Upgrade for unlimited saved foods.`;
const targetLimitNotice = `You can save up to ${TARGET_LIMIT} targets.`;
const e = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]!));
const n = (value: number) => Math.round(value * 10) / 10;
const namespace = () => demo ? 'demo:plan' : 'real:plan';
const knownRoutes = new Set(['/', '/demo', '/plan', '/privacy', '/terms']);
const isDemoLocation = () => location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const safeGet = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const safeSet = (key: string, value: string) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
const safeRemove = (key: string) => { try { localStorage.removeItem(key); } catch { /* optional license storage is unavailable */ } };

function titleFor(route: string) {
  if (route === '/demo' || (route === '/' && demo)) return 'Demo — Nutrient Floor';
  if (route === '/plan') return 'Planner — Nutrient Floor';
  if (route === '/privacy') return 'Privacy — Nutrient Floor';
  if (route === '/terms') return 'Terms — Nutrient Floor';
  if (!knownRoutes.has(route)) return 'Not found — Nutrient Floor';
  return 'Nutrient Floor — Plan meals around nutrient targets';
}
function link(path: string, label: string) { return `<a href="${path}" data-route ${activeRoute === path ? 'aria-current="page"' : ''}>${label}</a>`; }
function header() { return `<header class="site-header"><a class="wordmark" href="/" data-route aria-label="NF Nutrient Floor"><span aria-hidden="true">NF</span>Nutrient Floor</a><nav aria-label="Main navigation">${link('/demo', 'Demo')}${link('/plan', 'Planner')}${link('/privacy', 'Privacy')}</nav></header>`; }
function footer() { return `<footer><p>Nutrient Floor is a private meal planner.</p><p>${link('/privacy', 'Privacy')} · ${link('/terms', 'Terms')} · Built by Param Factory · v1.1</p></footer>`; }
function demoBanner() { return demo ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved.</span><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ''; }

function routeCopy(kind: 'privacy' | 'terms') {
  const privacy = `<h1 tabindex="-1">Your meal plan stays on this device.</h1><p>Nutrient Floor stores foods, targets, and meals in your browser’s local database. We do not run analytics or send your nutrition data to us.</p><h2>What is stored</h2><p>Your plan stays on this device until you export it, import another plan, or clear browser data. Demo data uses a separate local space and is discarded when you leave.</p><h2>Optional purchase</h2><p>Sociobot receives payment details if you buy the one-time upgrade. This app stores only its license token in your browser.</p><h2>Contact</h2><p>For product questions, email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p>`;
  const terms = `<h1 tabindex="-1">Use Nutrient Floor for personal meal planning.</h1><p>Nutrient Floor compares food values you enter with targets you choose. It is not medical advice or a nutrition diagnosis.</p><h2>Your data</h2><p>Check food labels and sources before relying on a value. Keep an export if your plan matters to you.</p><h2>One-time upgrade</h2><p>The optional $12 upgrade is sold by Sociobot, the merchant of record. A refunded or revoked license no longer unlocks unlimited saved foods.</p><h2>No warranty</h2><p>The app is provided as-is, to the extent allowed by law.</p>`;
  return kind === 'privacy' ? privacy : terms;
}

function landing() {
  const upgrade = licensed
    ? `<a class="button secondary" href="/plan" data-route>Open your upgraded planner</a>`
    : `<a class="button secondary" href="https://api.sociobot.in/api/v1/products/nutrient-floor-planner/checkout">Buy the $12 upgrade</a>`;
  return `<main id="main"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">A PRIVATE MEAL PLANNING SHEET</p><h1 id="hero-title" tabindex="-1">Plan meals that meet your nutrient targets.</h1><p class="lede">For home cooks who want enough fibre or protein without logging every calorie.</p><div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>Loads a seven-food plan.</span></div><ul class="facts"><li>Stored on this device</li><li>Works offline after setup</li><li>$12 one-time upgrade</li></ul></div><figure class="hero-art"><img src="/assets/hero.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="Ingredients arranged across a blue kitchen planning sheet." /><figcaption>Original generated illustration; food values are entered by you.</figcaption></figure></section><section class="live-preview ruled"><div><p class="eyebrow">THE QUESTION IT ANSWERS</p><h2>Will this small menu clear my floor?</h2><p>Pick a few targets, save familiar foods, and place meal portions on a week.</p></div><div class="mini-board"><span>FIBRE</span><b>33.5 g</b><i>above 30 g floor</i><span>PROTEIN</span><b>75.5 g</b><i>above 75 g floor</i></div></section><section class="how" aria-labelledby="how-title"><h2 id="how-title">Plan a week in three steps</h2><ol><li><b>01 / Set a target</b><span>Choose a floor or limit in grams.</span></li><li><b>02 / Save trusted foods</b><span>Copy values from a label or source.</span></li><li><b>03 / Place meals</b><span>See gaps before you cook.</span></li></ol></section><section class="plain-note"><h2>What this does not do</h2><p>It does not count calories, diagnose health conditions, or upload a food diary.</p></section><section class="upgrade"><div><p class="eyebrow">OPTIONAL ONE-TIME UPGRADE</p><h2>${licensed ? 'Your upgrade is active.' : 'Keep the basic planner free.'}</h2><p>${licensed ? 'You can save an unlimited pantry on this device.' : '$12 is a one-time purchase for unlimited saved foods.'}</p></div>${upgrade}<form data-form="license" class="license-form"><label>Have a license?<input name="license" required autocomplete="off" /></label><button class="text-button" type="submit">Restore purchase</button></form></section></main>`;
}

function targetRows() {
  const week = coverage(plan);
  if (!plan.targets.length) return `<div class="empty"><p>No targets yet.</p><button class="button small" data-action="show-target">Add your first target</button></div>`;
  return `<div class="target-list">${plan.targets.map(target => {
    const actual = week[target.key]; const state = status(target, actual); const wording = state.passes ? 'on plan' : target.kind === 'min' ? `${n(state.difference)} g short` : `${n(state.difference)} g over`;
    const label = `${target.label}: ${n(actual)} grams against a ${target.value} gram ${target.kind === 'min' ? 'floor' : 'limit'}, ${wording}`;
    return `<article class="target ${state.passes ? 'pass' : 'gap'}"><div><b>${e(target.label)}</b><small>${target.kind === 'min' ? 'floor' : 'limit'} · ${target.value} g</small></div><meter aria-label="${e(label)}" min="0" max="100" value="${Math.round(state.ratio * 100)}"></meter><div class="target-total"><b>${n(actual)} g</b><small>${wording}</small></div><button class="icon-button" data-action="ask-delete-target" data-id="${e(target.id)}" aria-label="Delete ${e(target.label)}">×</button></article>`;
  }).join('')}</div>`;
}
function foodList() {
  if (!plan.foods.length) return `<div class="empty"><p>Your saved foods will appear here.</p><button class="button small" data-action="show-food">Add a food</button></div>`;
  return `<div class="food-list">${plan.foods.map(food => `<article class="food"><div><b>${e(food.name)}</b><small>per ${e(food.serving)} · ${e(food.source)}</small></div><div>${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).filter(k => food.nutrients[k]).map(k => `<span>${food.nutrients[k]}g ${nutrientLabels[k].toLowerCase()}</span>`).join('')}</div><button class="icon-button" data-action="ask-delete-food" data-id="${e(food.id)}" aria-label="Delete ${e(food.name)}">×</button></article>`).join('')}</div>`;
}
function mealCard(meal: Plan['meals'][number]) {
  const total = totals(meal.portions, plan.foods);
  return `<article class="meal" draggable="true" data-meal="${e(meal.id)}"><div class="meal-top"><span class="day-label">${DAYS[meal.day]}</span><button class="icon-button" data-action="ask-delete-meal" data-id="${e(meal.id)}" aria-label="Delete ${e(meal.name)}">×</button></div><button class="meal-name" data-action="edit-meal" data-id="${e(meal.id)}">${e(meal.name)}</button><p>${meal.portions.length ? meal.portions.map(p => `${p.amount}× ${e(plan.foods.find(f => f.id === p.foodId)?.name || 'missing food')}`).join(' · ') : 'No portions yet'}</p><div class="meal-total">${plan.targets.slice(0, 2).map(t => `${n(total[t.key])}g ${t.key}`).join(' · ') || 'Add targets'}</div></article>`;
}
function planner() {
  return `<main id="main" class="app-main"><section class="planner-heading"><div><p class="eyebrow">WEEKLY COVERAGE / ${demo ? 'SAMPLE' : 'YOUR PLAN'}</p><h1 tabindex="-1">Build a week that clears your targets.</h1><p>Each value is per serving. Check your labels before you rely on a plan.</p></div><div class="toolbar"><button class="button small" data-action="export-json">Export plan</button><label class="button small file-button">Import plan<input type="file" accept="application/json" data-action="import-json" /></label><button class="button small" data-action="print-plan">Print week</button></div></section><section class="coverage-board ruled" aria-labelledby="coverage-title"><div class="board-head"><h2 id="coverage-title">Week at a glance</h2><span>${plan.meals.length} meal${plan.meals.length === 1 ? '' : 's'} planned</span></div>${targetRows()}</section><section id="planner" class="week" aria-labelledby="week-title"><div class="board-head"><h2 id="week-title">Place meals on your week</h2><button class="button small" data-action="new-meal">Add a meal</button></div><div class="days">${DAYS.map((day, i) => `<section class="day" data-day="${i}"><h3>${day}</h3>${plan.meals.filter(m => m.day === i).map(mealCard).join('')}<button class="add-meal" data-action="new-meal" data-day="${i}">+ Add meal</button></section>`).join('')}</div></section><section class="two-col"><section class="pantry ruled" aria-labelledby="pantry-title"><div class="board-head"><div><p class="eyebrow">SAVED FOOD LIST</p><h2 id="pantry-title">Your trusted pantry</h2></div><button class="button small" data-action="show-food">Add food</button></div>${foodList()}</section><section class="targets-panel" aria-labelledby="targets-title"><div class="board-head"><div><p class="eyebrow">UP TO 5 CUSTOM TARGETS</p><h2 id="targets-title">Your nutrient targets</h2></div><button class="button small" data-action="show-target">Add target</button></div>${plan.targets.length ? `<p class="muted">Use a floor for enough of something. Use a limit for less of something.</p>` : ''}</section></section></main>`;
}

function dialogMarkup() {
  const current = dialog;
  if (!current) return '';
  if (current.kind === 'food') return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="food"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">NEW SAVED FOOD</p><h2 id="modal-title">Add a food and its serving.</h2><label>Food name<input name="name" required maxlength="60" autofocus /></label><label>Serving <span class="hint">Example: ½ cup dry</span><input name="serving" required maxlength="40" /></label><label>Source or label<input name="source" required maxlength="80" placeholder="Label, packet at home" /></label><div class="nutrient-inputs">${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => `<label>${nutrientLabels[k]} (g)<input type="number" name="${k}" min="0" step="0.1" value="0" required /></label>`).join('')}</div><button class="button primary" type="submit">Save food</button></form></dialog>`;
  if (current.kind === 'target') return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="target"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">NEW TARGET</p><h2 id="modal-title">Add a nutrient floor or limit.</h2><label>Target name<input name="label" required maxlength="45" placeholder="Fibre floor" autofocus /></label><label>Nutrient<select name="key">${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => `<option value="${k}">${nutrientLabels[k]}</option>`).join('')}</select></label><label>Type<select name="kind"><option value="min">Minimum floor</option><option value="max">Maximum limit</option></select></label><label>Grams per week<input name="value" type="number" min="0.1" step="0.1" required /></label><button class="button primary" type="submit">Save target</button></form></dialog>`;
  if (current.kind === 'confirm') {
    const name = current.subject === 'food' ? plan.foods.find(f => f.id === current.id)?.name || 'this food' : current.subject === 'target' ? plan.targets.find(t => t.id === current.id)?.label || 'this target' : plan.meals.find(m => m.id === current.id)?.name || 'this meal';
    const mealsAffected = current.subject === 'food' ? plan.meals.filter(m => m.portions.some(p => p.foodId === current.id)).length : 0;
    const consequence = current.subject === 'food' ? `It will also remove portions from ${mealsAffected} meal${mealsAffected === 1 ? '' : 's'} and change their totals.` : current.subject === 'target' ? 'It will remove this target from your weekly coverage.' : 'It will remove this meal from your week.';
    return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="confirm-delete"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">CONFIRM REMOVAL</p><h2 id="modal-title">Remove ${e(name)}?</h2><p>${e(consequence)}</p><div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Keep it</button><button class="button danger" type="submit">Remove ${e(name)}</button></div></form></dialog>`;
  }
  const mealDialog = current as Extract<DialogState, { kind: 'meal' }>;
  const existing = mealDialog.id ? plan.meals.find(m => m.id === mealDialog.id) : undefined;
  const meal = existing || { id: '', name: '', day: mealDialog.day, portions: [] };
  return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="meal"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">MEAL PORTIONS</p><h2 id="modal-title">${existing ? 'Edit this meal.' : 'Add a meal.'}</h2><label>Meal name<input name="name" value="${e(meal.name)}" required maxlength="60" autofocus /></label><label>Day<select name="day">${DAYS.map((d, i) => `<option value="${i}" ${meal.day === i ? 'selected' : ''}>${d}</option>`).join('')}</select></label><fieldset><legend>Portions</legend>${plan.foods.length ? plan.foods.map(f => `<label class="portion"><span>${e(f.name)} <small>per ${e(f.serving)}</small></span><input type="number" name="food:${e(f.id)}" min="0" step="0.25" value="${meal.portions.find(p => p.foodId === f.id)?.amount || 0}" /></label>`).join('') : '<p>Add a food first, then return to this meal.</p>'}</fieldset><button class="button primary" type="submit">Save meal</button></form></dialog>`;
}

function notFound() { return `<main id="main" class="legal"><article><p class="eyebrow">404</p><h1 tabindex="-1">This page is not on the planning sheet.</h1><p>Return home or open the sample plan.</p><p><a class="button primary" href="/" data-route>Go home</a></p></article></main>`; }
function toastMarkup() { return `<div class="toast" role="status" aria-live="polite">${e(notice)}${waitingWorker ? '<button class="text-button" data-action="apply-update">Update now</button>' : ''}</div>`; }
function page() {
  let content: string;
  if (!knownRoutes.has(activeRoute)) content = `${header()}${notFound()}${footer()}`;
  else if (activeRoute === '/privacy' || activeRoute === '/terms') content = `${header()}<main id="main" class="legal"><article>${routeCopy(activeRoute.slice(1) as 'privacy' | 'terms')}</article></main>${footer()}`;
  else if (activeRoute === '/' && !demo) content = `${header()}${landing()}${footer()}`;
  else content = `${header()}${demoBanner()}${planner()}${footer()}${dialogMarkup()}`;
  return `${content}${toastMarkup()}`;
}
function openDialog() {
  const element = document.querySelector<HTMLDialogElement>('dialog[data-dialog]');
  if (!element) return;
  element.showModal();
  requestAnimationFrame(() => element.querySelector<HTMLElement>('[autofocus], input, select, button:not(.close)')?.focus());
}
function render() {
  activeRoute = location.pathname;
  document.title = titleFor(activeRoute);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = new URL(demo && activeRoute === '/' ? '/demo' : activeRoute, CANONICAL_ORIGIN).href;
  app.innerHTML = page();
  openDialog();
  if (focusRouteHeading) {
    focusRouteHeading = false;
    requestAnimationFrame(() => { const heading = document.querySelector<HTMLElement>('main h1'); heading?.focus(); routeLive.textContent = `${document.title}.`; });
  }
  if (notice) window.setTimeout(() => { notice = ''; const toast = document.querySelector('.toast'); if (toast) toast.textContent = ''; }, 8000);
}
function storageFailure() {
  notice = 'Browser storage is unavailable. Your changes were not saved. Enable site storage, then try again.';
}
async function save() {
  try { await writePlan(namespace(), plan); return true; }
  catch { storageFailure(); return false; }
}
async function load() {
  plan = await readPlan(namespace());
  if (demo && !plan.meals.length && !plan.foods.length && !plan.targets.length) { plan = samplePlan(); await save(); }
  render();
}
async function discardDemo() {
  try { await clearPlan('demo:plan'); }
  catch { storageFailure(); }
}
async function navigate(path: string) {
  if (demo && path !== '/demo') await discardDemo();
  history.pushState({}, '', path);
  demo = path === '/demo';
  focusRouteHeading = true;
  window.scrollTo(0, 0);
  await load();
}
function download(name: string, content: string, type = 'application/json') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
function rememberDialogOpener(el: HTMLElement) {
  const action = el.dataset.action;
  if (!action) { dialogReturnSelector = null; return; }
  const id = el.dataset.id ? `[data-id="${e(el.dataset.id)}"]` : '';
  const day = el.dataset.day ? `[data-day="${e(el.dataset.day)}"]` : '';
  dialogReturnSelector = `[data-action="${e(action)}"]${id}${day}`;
}
function closeDialog() {
  dialog = null;
  render();
  const returnSelector = dialogReturnSelector;
  if (returnSelector) window.setTimeout(() => document.querySelector<HTMLElement>(returnSelector)?.focus(), 0);
  dialogReturnSelector = null;
}
type LicenseVerdict = { valid: boolean; checkedAt: number };
function cachedVerdict() {
  try { const raw = safeGet(LICENSE_CHECK_KEY); return raw ? JSON.parse(raw) as LicenseVerdict : null; }
  catch { return null; }
}
async function verifyLicense(token: string, userInitiated = false) {
  if (!token) return;
  safeSet(LICENSE_KEY, token);
  licensed = true;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/nutrient-floor-planner/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('License verification failed');
    const verdict = await response.json() as { valid?: boolean };
    const valid = verdict.valid === true;
    safeSet(LICENSE_CHECK_KEY, JSON.stringify({ valid, checkedAt: Date.now() } satisfies LicenseVerdict));
    licensed = valid;
    if (!valid) { safeRemove(LICENSE_KEY); notice = 'This license is no longer active. Buy a new upgrade to restore unlimited foods.'; }
    else if (userInitiated) notice = 'Upgrade active on this device.';
  } catch {
    if (userInitiated) notice = 'We could not check this license. Check your connection and try again.';
  }
}
async function collectLicense() {
  const query = new URLSearchParams(location.search);
  const token = query.get('license');
  if (token) {
    safeSet(LICENSE_KEY, token);
    licensed = true;
    query.delete('license');
    history.replaceState({}, '', `${location.pathname}${query.size ? `?${query}` : ''}`);
    await verifyLicense(token, true);
    return;
  }
  const stored = safeGet(LICENSE_KEY);
  const verdict = cachedVerdict();
  if (!stored) return;
  licensed = verdict?.valid !== false;
  if (!verdict || Date.now() - verdict.checkedAt >= LICENSE_MAX_AGE) void verifyLicense(stored);
}

document.addEventListener('click', async event => {
  const el = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-route]');
  if (!el) return;
  const route = el.closest<HTMLAnchorElement>('[data-route]');
  if (route) { event.preventDefault(); void navigate(route.pathname); return; }
  const action = el.dataset.action; const id = el.dataset.id!;
  if (action === 'apply-update' && waitingWorker) { waitingWorker.postMessage('SKIP_WAITING'); location.reload(); return; }
  if (action === 'close-dialog') { closeDialog(); return; }
  if (action === 'show-food') { if (!demo && !canSaveFood(plan.foods.length, licensed)) { notice = foodLimitNotice; render(); } else { rememberDialogOpener(el); dialog = { kind: 'food' }; render(); } return; }
  if (action === 'show-target') { if (!canSaveTarget(plan.targets.length)) { notice = targetLimitNotice; render(); } else { rememberDialogOpener(el); dialog = { kind: 'target' }; render(); } return; }
  if (action === 'new-meal') { rememberDialogOpener(el); dialog = { kind: 'meal', day: Number(el.dataset.day || 0) }; render(); return; }
  if (action === 'edit-meal') { const meal = plan.meals.find(m => m.id === id); if (meal) { rememberDialogOpener(el); dialog = { kind: 'meal', id, day: meal.day }; render(); } return; }
  if (action?.startsWith('ask-delete-')) { rememberDialogOpener(el); dialog = { kind: 'confirm', subject: action.slice('ask-delete-'.length) as 'food' | 'target' | 'meal', id }; render(); return; }
  if (action === 'reset-demo') { try { await clearPlan('demo:plan'); plan = samplePlan(); if (await save()) notice = 'Sample plan reset.'; } catch { storageFailure(); } render(); return; }
  if (action === 'start-real') { await discardDemo(); demo = false; history.replaceState({}, '', '/plan'); focusRouteHeading = true; notice = 'Your private plan is ready.'; await load(); return; }
  if (action === 'export-json') { download('nutrient-floor-plan.json', JSON.stringify(plan, null, 2)); notice = 'Plan exported as JSON.'; render(); return; }
  if (action === 'print-plan') window.print();
});

document.addEventListener('close', event => { if ((event.target as HTMLElement).matches('dialog[data-dialog]') && dialog) closeDialog(); }, true);
document.addEventListener('submit', async event => {
  const form = event.target as HTMLFormElement; const formName = form.dataset.form;
  if (!formName) return;
  event.preventDefault();
  const data = new FormData(form);
  if (formName === 'license') {
    await verifyLicense(String(data.get('license')).trim(), true);
    render();
    return;
  }
  const previousPlan = structuredClone(plan);
  if (formName === 'confirm-delete' && dialog?.kind === 'confirm') {
    const { subject, id } = dialog;
    if (subject === 'food') { plan.foods = plan.foods.filter(f => f.id !== id); plan.meals.forEach(m => { m.portions = m.portions.filter(p => p.foodId !== id); }); notice = 'Food removed from pantry and affected meals.'; }
    if (subject === 'target') { plan.targets = plan.targets.filter(t => t.id !== id); notice = 'Target removed.'; }
    if (subject === 'meal') { plan.meals = plan.meals.filter(m => m.id !== id); notice = 'Meal removed.'; }
    if (!await save()) { plan = previousPlan; render(); return; }
    closeDialog(); return;
  }
  if (formName === 'food') {
    if (!demo && !canSaveFood(plan.foods.length, licensed)) { notice = foodLimitNotice; render(); return; }
    const nutrients = Object.fromEntries((['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => [k, Number(data.get(k))])) as Food['nutrients'];
    plan.foods.push({ id: makeId(), name: String(data.get('name')).trim(), serving: String(data.get('serving')).trim(), source: String(data.get('source')).trim(), nutrients }); notice = 'Food saved to your pantry.';
  }
  if (formName === 'target') {
    if (!canSaveTarget(plan.targets.length)) { notice = targetLimitNotice; render(); return; }
    plan.targets.push({ id: makeId(), label: String(data.get('label')).trim(), key: data.get('key') as NutrientKey, kind: data.get('kind') as Target['kind'], value: Number(data.get('value')), unit: 'g' }); notice = 'Target saved.';
  }
  if (formName === 'meal' && dialog?.kind === 'meal') {
    const mealDialog = dialog;
    const portions = plan.foods.map(f => ({ foodId: f.id, amount: Number(data.get(`food:${f.id}`)) })).filter(p => p.amount > 0);
    const result = { id: mealDialog.id || makeId(), name: String(data.get('name')).trim(), day: Number(data.get('day')), portions };
    const index = plan.meals.findIndex(m => m.id === mealDialog.id);
    if (index >= 0) plan.meals[index] = result; else plan.meals.push(result);
    notice = 'Meal saved to your week.';
  }
  if (!await save()) { plan = previousPlan; render(); return; }
  closeDialog();
});
document.addEventListener('change', async event => {
  const input = event.target as HTMLInputElement;
  if (input.dataset.action !== 'import-json' || !input.files?.[0]) return;
  try {
    const incoming: unknown = JSON.parse(await input.files[0].text());
    if (!isPlan(incoming)) throw new Error('Invalid plan');
    if (!demo && !canImportFoods(incoming.foods.length, licensed)) {
      notice = `That plan has more than ${FREE_FOOD_LIMIT} foods. Upgrade first, then import it.`;
      render();
      return;
    }
    const previousPlan = plan;
    plan = incoming;
    if (await save()) notice = 'Plan imported.';
    else plan = previousPlan;
  } catch { notice = 'That file is not a valid Nutrient Floor plan. Choose an exported JSON file.'; }
  render();
});
window.addEventListener('popstate', () => {
  const nextDemo = isDemoLocation();
  if (demo && !nextDemo) void discardDemo();
  demo = nextDemo;
  focusRouteHeading = true;
  void load();
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(registration => {
  const announceUpdate = () => { if (registration.waiting && navigator.serviceWorker.controller) { waitingWorker = registration.waiting; notice = 'An update is ready.'; render(); } };
  registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', announceUpdate));
}).catch(() => undefined);
void collectLicense().then(load);
