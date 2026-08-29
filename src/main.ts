import './style.css';
import { TARGET_LIMIT, blankPlan, canSaveTarget, coverage, formatNutrient, isPlan, makeId, normalizeRequiredText, nutrientLabels, samplePlan, status, totals, type Food, type NutrientKey, type Plan, type Target } from './model';
import { clearPlan, readPlan, writePlan } from './store';
import { applyWaitingServiceWorkerUpdate } from './update';

const app = document.querySelector<HTMLDivElement>('#app')!;
const routeLive = document.querySelector<HTMLDivElement>('#route-live')!;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
type DialogState = { kind: 'food' | 'target'; id?: string } | { kind: 'meal'; id?: string; day: number } | { kind: 'confirm'; subject: 'food' | 'target' | 'meal'; id: string };

let demo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
let plan: Plan = blankPlan();
let notice = '';
let dialog: DialogState | null = null;
let activeRoute = location.pathname;
let focusRouteHeading = false;
let waitingWorker: ServiceWorker | null = null;
let dialogReturnSelector: string | null = null;
let dialogError = '';
const CANONICAL_ORIGIN = 'https://nutrient-floor-planner.sociobot.in';
const targetLimitNotice = `You can save up to ${TARGET_LIMIT} targets.`;
const e = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]!));
const namespace = () => 'real:plan';
const knownRoutes = new Set(['/', '/demo', '/plan', '/privacy', '/terms']);
const isDemoLocation = () => location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
function routeMeta(route: string) {
  if (route === '/demo' || (route === '/' && demo)) return { title: 'Demo — Nutrient Floor', description: 'Try a sample weekly meal plan with seven foods, three meals, and three nutrient targets.', canonical: '/demo' };
  if (route === '/plan') return { title: 'Planner — Nutrient Floor', description: 'Build a weekly meal plan and compare it with nutrient floors and limits you choose.', canonical: '/plan' };
  if (route === '/privacy') return { title: 'Privacy — Nutrient Floor', description: 'Learn how Nutrient Floor keeps meal plans in browser storage and separates sample data.', canonical: '/privacy' };
  if (route === '/terms') return { title: 'Terms — Nutrient Floor', description: 'Read the terms for using Nutrient Floor as a personal meal planning tool.', canonical: '/terms' };
  if (!knownRoutes.has(route)) return { title: 'Page not found — Nutrient Floor', description: 'This Nutrient Floor page could not be found. Open the planner or sample plan.', canonical: route };
  return { title: 'Nutrient Floor — Plan meals around nutrient targets', description: 'Plan a week of meals and compare the foods you enter with nutrient targets you choose.', canonical: '/' };
}
function link(path: string, label: string) { const current = activeRoute === path || (path === '/demo' && demo); return `<a href="${path}" data-route ${current ? 'aria-current="page"' : ''}>${label}</a>`; }
function header() { return `<header class="site-header"><a class="wordmark" href="/" data-route aria-label="NF Nutrient Floor"><span aria-hidden="true">NF</span>Nutrient Floor</a><nav aria-label="Main navigation">${link('/demo', 'Demo')}${link('/plan', 'Planner')}${link('/privacy', 'Privacy')}</nav></header>`; }
function footer() { return `<footer><p>Private meal planning around your nutrient targets.</p><p>${link('/privacy', 'Privacy')} · ${link('/terms', 'Terms')} · Built by Param Factory · v1.5</p></footer>`; }
function demoBanner() { return demo ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved.</span><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ''; }

function routeCopy(kind: 'privacy' | 'terms') {
  const privacy = `<h1 tabindex="-1">Your meal plan stays on this device.</h1><p>Nutrient Floor stores foods, targets, and meals in your browser. It does not use analytics or send your plan elsewhere.</p><h2>What is stored</h2><p>Your plan remains until you import another plan or clear browser data. You can export a copy at any time.</p><h2>How the sample stays separate</h2><p>Sample changes stay only in the open demo. Reloading or leaving restores the bundled sample and never alters your real plan.</p><h2>Contact</h2><p>For product questions, email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p>`;
  const terms = `<h1 tabindex="-1">Use Nutrient Floor for personal meal planning.</h1><p>Nutrient Floor compares food values you enter with targets you choose.</p><h2>Choose your targets</h2><p>You choose every target value. The planner does not supply recommended target values.</p><h2>Check your values</h2><p>Check food labels and sources before relying on a value. Ask a qualified professional about personal nutrition needs.</p><h2>Keep a copy</h2><p>Export your plan if you need a backup.</p><h2>No warranty</h2><p>The app is provided as-is, to the extent allowed by law.</p>`;
  return kind === 'privacy' ? privacy : terms;
}

function landing() {
  return `<main id="main" tabindex="-1"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">PRIVATE MEAL PLANNER</p><h1 id="hero-title" tabindex="-1">Plan meals that meet your nutrient targets.</h1><p class="lede">For home cooks who want enough fibre or protein without logging every calorie.</p><div class="hero-actions"><a class="button primary" href="/?demo=1" data-route>Try it with sample data</a><span>Loads seven foods, three meals, and three targets.</span></div><ul class="facts"><li>Free to use</li><li>Stored on this device</li><li>Works offline after setup</li></ul></div><figure class="hero-art"><img src="/assets/hero.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="Ingredients arranged across a blue kitchen planning sheet." /></figure></section><section class="live-preview ruled"><div><h2>Sample weekly nutrient totals</h2><p>Save familiar foods, choose targets, and place meal portions on a week.</p></div><div class="mini-board"><span>FIBRE</span><b>40 g</b><i>above the 30 g floor</i><span>PROTEIN</span><b>75.5 g</b><i>above the 75 g floor</i></div></section><section class="how" aria-labelledby="how-title"><h2 id="how-title">Plan a week in three steps</h2><ol><li><b>01 / Set a target</b><span>Choose a floor or limit in grams.</span></li><li><b>02 / Save your foods</b><span>Enter values and a source from the label.</span></li><li><b>03 / Place meals</b><span>See gaps before you cook.</span></li></ol></section><section class="plain-note"><h2>How your food values are used</h2><p>The planner compares your food values with your targets. Check labels before relying on the totals.</p></section></main>`;
}

function targetRows() {
  const week = coverage(plan);
  if (!plan.targets.length) return `<div class="empty"><p>No targets yet.</p><button class="button small" data-action="show-target">Add your first target</button></div>`;
  return `<div class="target-list">${plan.targets.map(target => {
    const state = status(target, week[target.key]);
    const actual = formatNutrient(state.actual);
    const targetValue = formatNutrient(state.target);
    const difference = formatNutrient(state.difference);
    const wording = state.passes ? 'on plan' : target.kind === 'min' ? `${difference} g short` : `${difference} g over`;
    const label = `${target.label}: ${actual} grams against a ${targetValue} gram ${target.kind === 'min' ? 'floor' : 'limit'}, ${wording}`;
    return `<article class="target ${state.passes ? 'pass' : 'gap'}"><div><b>${e(target.label)}</b><small>${target.kind === 'min' ? 'floor' : 'limit'} · ${targetValue} g</small></div><meter aria-label="${e(label)}" min="0" max="100" value="${Math.round(state.ratio * 100)}"></meter><div class="target-total"><b>${actual} g</b><small>${wording}</small></div><div class="record-actions"><button class="icon-button edit-button" data-action="edit-target" data-id="${e(target.id)}" aria-label="Edit ${e(target.label)}">Edit</button><button class="icon-button delete-button" data-action="ask-delete-target" data-id="${e(target.id)}" aria-label="Delete ${e(target.label)}">×</button></div></article>`;
  }).join('')}</div>`;
}
function foodList() {
  if (!plan.foods.length) return `<div class="empty"><p>Your saved foods will appear here.</p><button class="button small" data-action="show-food">Add a food</button></div>`;
  return `<div class="food-list">${plan.foods.map(food => `<article class="food"><div><b>${e(food.name)}</b><small>per ${e(food.serving)} · ${e(food.source)}</small></div><div>${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).filter(k => food.nutrients[k]).map(k => `<span>${formatNutrient(food.nutrients[k])}g ${nutrientLabels[k].toLowerCase()}</span>`).join('')}</div><div class="record-actions"><button class="icon-button edit-button" data-action="edit-food" data-id="${e(food.id)}" aria-label="Edit ${e(food.name)}">Edit</button><button class="icon-button delete-button" data-action="ask-delete-food" data-id="${e(food.id)}" aria-label="Delete ${e(food.name)}">×</button></div></article>`).join('')}</div>`;
}
function mealCard(meal: Plan['meals'][number]) {
  const total = totals(meal.portions, plan.foods);
  return `<article class="meal" data-meal="${e(meal.id)}"><div class="meal-top"><span class="day-label">${DAYS[meal.day]}</span><button class="icon-button" data-action="ask-delete-meal" data-id="${e(meal.id)}" aria-label="Delete ${e(meal.name)}">×</button></div><button class="meal-name" data-action="edit-meal" data-id="${e(meal.id)}">${e(meal.name)}</button><p>${meal.portions.length ? meal.portions.map(p => `${p.amount}× ${e(plan.foods.find(f => f.id === p.foodId)?.name || 'missing food')}`).join(' · ') : 'No portions yet'}</p><div class="meal-total">${plan.targets.slice(0, 2).map(t => `${formatNutrient(total[t.key])}g ${t.key}`).join(' · ') || 'Add targets'}</div></article>`;
}
function planner() {
  return `<main id="main" class="app-main" tabindex="-1"><section class="planner-heading"><div><p class="eyebrow">WEEKLY TOTALS / ${demo ? 'SAMPLE PLAN' : 'YOUR PLAN'}</p><h1 tabindex="-1">Build a week that meets your targets.</h1><p>Each value is per serving. Check your labels before you rely on a plan.</p></div><div class="toolbar"><button class="button small" data-action="export-json">Export plan</button><label class="button small file-button">Import plan<input type="file" accept="application/json" data-action="import-json" /></label><button class="button small" data-action="print-plan">Print week</button></div></section><section class="coverage-board ruled" aria-labelledby="coverage-title"><div class="board-head"><h2 id="coverage-title">Week at a glance</h2><span>${plan.meals.length} meal${plan.meals.length === 1 ? '' : 's'} planned</span></div>${targetRows()}</section><section id="planner" class="week" aria-labelledby="week-title"><div class="board-head"><h2 id="week-title">Place meals on your week</h2><button class="button small" data-action="new-meal">Add a meal</button></div><div class="days">${DAYS.map((day, i) => `<section class="day" data-day="${i}"><h3>${day}</h3>${plan.meals.filter(m => m.day === i).map(mealCard).join('')}<button class="add-meal" data-action="new-meal" data-day="${i}">+ Add meal</button></section>`).join('')}</div></section><section class="two-col"><section class="pantry ruled" aria-labelledby="pantry-title"><div class="board-head"><div><p class="eyebrow">SAVED FOODS</p><h2 id="pantry-title">Your saved foods</h2></div><button class="button small" data-action="show-food">Add food</button></div>${foodList()}</section><section class="targets-panel" aria-labelledby="targets-title"><div class="board-head"><div><p class="eyebrow">UP TO 5 TARGETS</p><h2 id="targets-title">Your nutrient targets</h2></div><button class="button small" data-action="show-target">Add target</button></div>${plan.targets.length ? `<p class="muted">Use a floor for enough of something. Use a limit for less of something.</p>` : ''}</section></section></main>`;
}

function dialogMarkup() {
  const current = dialog;
  if (!current) return '';
  const error = `<p id="form-error" class="form-error" role="alert"${dialogError ? '' : ' hidden'}>${e(dialogError)}</p>`;
  if (current.kind === 'food') {
    const existing = current.id ? plan.foods.find(food => food.id === current.id) : undefined;
    const food = existing || { name: '', serving: '', source: '', nutrients: { fibre: 0, protein: 0, sugar: 0, saturatedFat: 0 } };
    return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="food" aria-describedby="form-error"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">${existing ? 'EDIT SAVED FOOD' : 'NEW SAVED FOOD'}</p><h2 id="modal-title">${existing ? 'Edit this food and its serving.' : 'Add a food and its serving.'}</h2>${error}<label>Food name<input name="name" value="${e(food.name)}" required maxlength="60" aria-describedby="form-error" autofocus /></label><label>Serving <span class="hint">Example: ½ cup dry</span><input name="serving" value="${e(food.serving)}" required maxlength="40" aria-describedby="form-error" /></label><label>Source or label<input name="source" value="${e(food.source)}" required maxlength="80" aria-describedby="form-error" placeholder="Label, packet at home" /></label><div class="nutrient-inputs">${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => `<label>${nutrientLabels[k]} (g)<input type="number" name="${k}" min="0" step="0.1" value="${food.nutrients[k]}" required /></label>`).join('')}</div><button class="button primary" type="submit">${existing ? 'Save food changes' : 'Save food'}</button></form></dialog>`;
  }
  if (current.kind === 'target') {
    const existing = current.id ? plan.targets.find(target => target.id === current.id) : undefined;
    const target = existing || { label: '', key: 'fibre' as NutrientKey, kind: 'min' as Target['kind'], value: '' };
    return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="target" aria-describedby="form-error"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">${existing ? 'EDIT TARGET' : 'NEW TARGET'}</p><h2 id="modal-title">${existing ? 'Edit this nutrient floor or limit.' : 'Add a nutrient floor or limit.'}</h2>${error}<label>Target name<input name="label" value="${e(target.label)}" required maxlength="45" aria-describedby="form-error" placeholder="Fibre floor" autofocus /></label><label>Nutrient<select name="key">${(['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => `<option value="${k}" ${target.key === k ? 'selected' : ''}>${nutrientLabels[k]}</option>`).join('')}</select></label><label>Type<select name="kind"><option value="min" ${target.kind === 'min' ? 'selected' : ''}>Minimum floor</option><option value="max" ${target.kind === 'max' ? 'selected' : ''}>Maximum limit</option></select></label><label>Grams per week<input name="value" type="number" min="0.1" step="0.1" value="${target.value}" required /></label><button class="button primary" type="submit">${existing ? 'Save target changes' : 'Save target'}</button></form></dialog>`;
  }
  if (current.kind === 'confirm') {
    const name = current.subject === 'food' ? plan.foods.find(f => f.id === current.id)?.name || 'this food' : current.subject === 'target' ? plan.targets.find(t => t.id === current.id)?.label || 'this target' : plan.meals.find(m => m.id === current.id)?.name || 'this meal';
    const mealsAffected = current.subject === 'food' ? plan.meals.filter(m => m.portions.some(p => p.foodId === current.id)).length : 0;
    const consequence = current.subject === 'food' ? `It will also remove portions from ${mealsAffected} meal${mealsAffected === 1 ? '' : 's'} and change their totals.` : current.subject === 'target' ? 'It will remove this target from your weekly coverage.' : 'It will remove this meal from your week.';
    return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="confirm-delete"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">CONFIRM REMOVAL</p><h2 id="modal-title">Remove ${e(name)}?</h2><p>${e(consequence)}</p><div class="dialog-actions"><button class="button" type="button" data-action="close-dialog">Keep it</button><button class="button danger" type="submit">Remove ${e(name)}</button></div></form></dialog>`;
  }
  const mealDialog = current as Extract<DialogState, { kind: 'meal' }>;
  const existing = mealDialog.id ? plan.meals.find(m => m.id === mealDialog.id) : undefined;
  const meal = existing || { id: '', name: '', day: mealDialog.day, portions: [] };
  return `<dialog class="modal" data-dialog aria-labelledby="modal-title"><form data-form="meal" aria-describedby="form-error"><button type="button" class="close" data-action="close-dialog" aria-label="Close">×</button><p class="eyebrow">MEAL PORTIONS</p><h2 id="modal-title">${existing ? 'Edit this meal.' : 'Add a meal.'}</h2>${error}<label>Meal name<input name="name" value="${e(meal.name)}" required maxlength="60" aria-describedby="form-error" autofocus /></label><label>Day<select name="day">${DAYS.map((d, i) => `<option value="${i}" ${meal.day === i ? 'selected' : ''}>${d}</option>`).join('')}</select></label><fieldset><legend>Portions</legend>${plan.foods.length ? plan.foods.map(f => `<label class="portion"><span>${e(f.name)} <small>per ${e(f.serving)}</small></span><input type="number" name="food:${e(f.id)}" min="0" step="0.25" value="${meal.portions.find(p => p.foodId === f.id)?.amount || 0}" /></label>`).join('') : '<p>Add a food first, then return to this meal.</p>'}</fieldset><button class="button primary" type="submit">Save meal</button></form></dialog>`;
}

function notFound() { return `<main id="main" class="legal" tabindex="-1"><article><p class="eyebrow">NUTRIENT FLOOR</p><h1 tabindex="-1">Page not found</h1><p>The address does not match a page in this planner.</p><div class="not-found-actions"><a class="button primary" href="/?demo=1" data-route>Open the sample plan</a><a class="button" href="/plan" data-route>Go to the planner</a></div></article></main>`; }
function toastMarkup() { return `<div class="toast" role="status" aria-live="polite">${e(notice)}${waitingWorker ? '<button class="text-button" data-action="apply-update">Update now</button>' : ''}</div>`; }
function page() {
  let content: string;
  if (!knownRoutes.has(activeRoute)) content = `${header()}${notFound()}${footer()}`;
  else if (activeRoute === '/privacy' || activeRoute === '/terms') content = `${header()}<main id="main" class="legal" tabindex="-1"><article>${routeCopy(activeRoute.slice(1) as 'privacy' | 'terms')}</article></main>${footer()}`;
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
  const meta = routeMeta(activeRoute);
  document.title = meta.title;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = new URL(meta.canonical, CANONICAL_ORIGIN).href;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', meta.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', meta.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', meta.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', new URL(meta.canonical, CANONICAL_ORIGIN).href);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', meta.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', meta.description);
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
  if (demo) return true;
  try { await writePlan(namespace(), plan); return true; }
  catch { storageFailure(); return false; }
}
async function load() {
  if (demo) {
    // The demo is intentionally in-memory. Clearing this legacy key also
    // removes any sample data saved by earlier versions of the app.
    await discardDemo(true);
    plan = samplePlan();
  } else plan = await readPlan(namespace());
  render();
}
async function discardDemo(quiet = false) {
  try { await clearPlan('demo:plan'); }
  catch { if (!quiet) storageFailure(); }
}
async function navigate(path: string) {
  if (demo && path !== '/demo') await discardDemo();
  history.pushState({}, '', path);
  demo = isDemoLocation();
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
  dialogError = '';
  render();
  const returnSelector = dialogReturnSelector;
  if (returnSelector) window.setTimeout(() => document.querySelector<HTMLElement>(returnSelector)?.focus(), 0);
  dialogReturnSelector = null;
}
document.addEventListener('click', event => {
  const skip = (event.target as HTMLElement).closest<HTMLAnchorElement>('.skip');
  if (!skip) return;
  const main = document.getElementById('main');
  if (!main) return;
  event.preventDefault();
  history.pushState({}, '', '#main');
  main.focus({ preventScroll: true });
  main.scrollIntoView({ block: 'start' });
});

document.addEventListener('click', async event => {
  const el = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-route]');
  if (!el) return;
  const route = el.closest<HTMLAnchorElement>('[data-route]');
  if (route) { event.preventDefault(); void navigate(`${route.pathname}${route.search}`); return; }
  const action = el.dataset.action; const id = el.dataset.id!;
  if (action === 'apply-update' && waitingWorker) { applyWaitingServiceWorkerUpdate(navigator.serviceWorker, waitingWorker, () => location.reload()); return; }
  if (action === 'close-dialog') { closeDialog(); return; }
  if (action === 'show-food') { rememberDialogOpener(el); dialog = { kind: 'food' }; render(); return; }
  if (action === 'show-target') { if (!canSaveTarget(plan.targets.length)) { notice = targetLimitNotice; render(); } else { rememberDialogOpener(el); dialog = { kind: 'target' }; render(); } return; }
  if (action === 'edit-food') { if (plan.foods.some(food => food.id === id)) { rememberDialogOpener(el); dialog = { kind: 'food', id }; render(); } return; }
  if (action === 'edit-target') { if (plan.targets.some(target => target.id === id)) { rememberDialogOpener(el); dialog = { kind: 'target', id }; render(); } return; }
  if (action === 'new-meal') { rememberDialogOpener(el); dialog = { kind: 'meal', day: Number(el.dataset.day || 0) }; render(); return; }
  if (action === 'edit-meal') { const meal = plan.meals.find(m => m.id === id); if (meal) { rememberDialogOpener(el); dialog = { kind: 'meal', id, day: meal.day }; render(); } return; }
  if (action?.startsWith('ask-delete-')) { rememberDialogOpener(el); dialog = { kind: 'confirm', subject: action.slice('ask-delete-'.length) as 'food' | 'target' | 'meal', id }; render(); return; }
  if (action === 'reset-demo') { plan = samplePlan(); notice = 'Sample plan reset.'; render(); return; }
  if (action === 'start-real') { await discardDemo(); demo = false; history.replaceState({}, '', '/plan'); focusRouteHeading = true; notice = 'Your private plan is ready.'; await load(); return; }
  if (action === 'export-json') { download('nutrient-floor-plan.json', JSON.stringify(plan, null, 2)); notice = 'Plan exported as JSON.'; render(); return; }
  if (action === 'print-plan') window.print();
});

document.addEventListener('close', event => { if ((event.target as HTMLElement).matches('dialog[data-dialog]') && dialog) closeDialog(); }, true);
function showFormError(form: HTMLFormElement, fieldName: string, message: string) {
  dialogError = message;
  const error = form.querySelector<HTMLElement>('#form-error');
  if (error) { error.textContent = message; error.hidden = false; }
  const field = form.elements.namedItem(fieldName) as HTMLElement | null;
  field?.setAttribute('aria-invalid', 'true');
  field?.focus();
}
function formText(data: FormData, form: HTMLFormElement, fieldName: string, max: number, label: string) {
  const value = normalizeRequiredText(data.get(fieldName), max);
  if (value) return value;
  showFormError(form, fieldName, `Enter a ${label.toLowerCase()}. It cannot be blank.`);
  return null;
}
document.addEventListener('submit', async event => {
  const form = event.target as HTMLFormElement; const formName = form.dataset.form;
  if (!formName) return;
  event.preventDefault();
  const data = new FormData(form);
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
    const name = formText(data, form, 'name', 60, 'Food name');
    const serving = formText(data, form, 'serving', 40, 'Serving');
    const source = formText(data, form, 'source', 80, 'Source or label');
    if (!name || !serving || !source) return;
    const nutrients = Object.fromEntries((['fibre', 'protein', 'sugar', 'saturatedFat'] as NutrientKey[]).map(k => [k, Number(data.get(k))])) as Food['nutrients'];
    const foodId = dialog?.kind === 'food' ? dialog.id : undefined;
    const record = { id: foodId || makeId(), name, serving, source, nutrients };
    const foodIndex = plan.foods.findIndex(food => food.id === foodId);
    const nextPlan = { ...plan, foods: foodIndex >= 0 ? plan.foods.map((food, index) => index === foodIndex ? record : food) : [...plan.foods, record] };
    if (!isPlan(nextPlan)) { showFormError(form, 'name', 'Check the food values, then try again.'); return; }
    plan = nextPlan; notice = foodIndex >= 0 ? 'Food changes saved.' : 'Food saved to your pantry.';
  }
  if (formName === 'target') {
    const targetId = dialog?.kind === 'target' ? dialog.id : undefined;
    if (!targetId && !canSaveTarget(plan.targets.length)) { notice = targetLimitNotice; render(); return; }
    const label = formText(data, form, 'label', 45, 'Target name');
    if (!label) return;
    const record = { id: targetId || makeId(), label, key: data.get('key') as NutrientKey, kind: data.get('kind') as Target['kind'], value: Number(data.get('value')), unit: 'g' };
    const targetIndex = plan.targets.findIndex(target => target.id === targetId);
    const nextPlan = { ...plan, targets: targetIndex >= 0 ? plan.targets.map((target, index) => index === targetIndex ? record : target) : [...plan.targets, record] };
    if (!isPlan(nextPlan)) { showFormError(form, 'label', 'Check the target values, then try again.'); return; }
    plan = nextPlan; notice = targetIndex >= 0 ? 'Target changes saved.' : 'Target saved.';
  }
  if (formName === 'meal' && dialog?.kind === 'meal') {
    const mealDialog = dialog;
    const name = formText(data, form, 'name', 60, 'Meal name');
    if (!name) return;
    const portions = plan.foods.map(f => ({ foodId: f.id, amount: Number(data.get(`food:${f.id}`)) })).filter(p => p.amount > 0);
    const result = { id: mealDialog.id || makeId(), name, day: Number(data.get('day')), portions };
    const index = plan.meals.findIndex(m => m.id === mealDialog.id);
    const meals = index >= 0 ? plan.meals.map((meal, mealIndex) => mealIndex === index ? result : meal) : [...plan.meals, result];
    const nextPlan = { ...plan, meals };
    if (!isPlan(nextPlan)) { showFormError(form, 'name', 'Check the meal values, then try again.'); return; }
    plan = nextPlan;
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
    const previousPlan = plan;
    plan = incoming;
    if (await save()) notice = 'Plan imported.';
    else plan = previousPlan;
  } catch { notice = 'That file is not a valid Nutrient Floor plan. Choose an exported JSON file.'; }
  render();
});
window.addEventListener('popstate', async () => {
  const nextDemo = isDemoLocation();
  if (demo && !nextDemo) await discardDemo();
  demo = nextDemo;
  focusRouteHeading = true;
  await load();
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(registration => {
  const announceUpdate = () => { if (registration.waiting && navigator.serviceWorker.controller) { waitingWorker = registration.waiting; notice = 'An update is ready.'; render(); } };
  registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', announceUpdate));
}).catch(() => undefined);
void load();
