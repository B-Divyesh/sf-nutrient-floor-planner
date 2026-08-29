import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const [claimText, browserTests] = await Promise.all([
  readFile(`${root}.factory/claims.json`, 'utf8'),
  readFile(`${root}tests/claims.spec.ts`, 'utf8')
]);
const claims = JSON.parse(claimText);

if (!Array.isArray(claims) || claims.length === 0) {
  throw new Error('.factory/claims.json must contain at least one claim.');
}

const ids = new Set();
for (const claim of claims) {
  for (const key of ['id', 'claim', 'where', 'test', 'sandbox']) {
    if (typeof claim[key] !== 'string' || claim[key].trim() === '') {
      throw new Error(`Claim ${claim.id || '(missing id)'} has no ${key}.`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(claim.id)) {
    throw new Error(`Claim id ${claim.id} is not kebab-case.`);
  }
  if (ids.has(claim.id)) throw new Error(`Claim id ${claim.id} is duplicated.`);
  ids.add(claim.id);

  const tag = `@claim:${claim.id}`;
  const occurrences = browserTests.split(tag).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${tag} must appear in exactly one browser test; found ${occurrences}.`);
  }
  if (claim.test !== `npx playwright test --grep ${tag}`) {
    throw new Error(`Claim ${claim.id} must provide its exact tagged Playwright command.`);
  }
}

const declaredTags = [...browserTests.matchAll(/@claim:([a-z0-9]+(?:-[a-z0-9]+)*)/g)].map(match => match[1]);
const undeclared = declaredTags.filter(id => !ids.has(id));
if (undeclared.length) throw new Error(`Browser claim tags missing from claims.json: ${undeclared.join(', ')}`);

console.log(`Claim inventory matches ${claims.length} one-to-one browser tests.`);
