import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { route } from './route.mjs';

test('a mixed pull request turns on frontend, backend and security', () => {
  const r = route([
    'src/components/CheckoutForm.tsx',
    'api/payments/webhook.py',
    'README.md',
  ]);
  assert.equal(r.review, true);
  assert.equal(r.frontend, true);
  assert.equal(r.backend, true);
  assert.equal(r.security, true);
  assert.deepEqual(r.files.frontend, ['src/components/CheckoutForm.tsx']);
  assert.deepEqual(r.files.backend, ['api/payments/webhook.py']);
  assert.deepEqual(r.files.security, ['src/components/CheckoutForm.tsx', 'api/payments/webhook.py']);
  assert.ok(!r.files.reviewable.includes('README.md'));
});

test('a docs-only pull request needs no review', () => {
  const r = route(['README.md', 'docs/setup.md', 'docs/img/flow.png', 'LICENSE']);
  assert.equal(r.review, false);
  assert.equal(r.frontend, false);
  assert.equal(r.backend, false);
  assert.equal(r.security, false);
});

test('a workflow file turns on the security pass only', () => {
  const r = route(['.github/workflows/deploy.yml']);
  assert.equal(r.review, true);
  assert.equal(r.security, true);
  assert.equal(r.frontend, false);
  assert.equal(r.backend, false);
});

test('a TypeScript file in a server folder is backend, not frontend', () => {
  const r = route(['server/routes/users.ts']);
  assert.equal(r.backend, true);
  assert.equal(r.frontend, false);
});

test('a TypeScript hook is frontend', () => {
  const r = route(['src/hooks/useOrders.ts']);
  assert.equal(r.frontend, true);
  assert.equal(r.backend, false);
});

test('a plain config change still gets the core review', () => {
  const r = route(['package.json']);
  assert.equal(r.review, true);
  assert.equal(r.frontend, false);
  assert.equal(r.backend, false);
  assert.equal(r.security, false);
});

test('blank lines and duplicates are ignored', () => {
  const r = route(['', 'app/page.tsx', 'app/page.tsx', '  ']);
  assert.deepEqual(r.files.reviewable, ['app/page.tsx']);
});

test('the CLI reads paths from stdin and prints JSON', () => {
  const script = fileURLToPath(new URL('./route.mjs', import.meta.url));
  const out = execFileSync('node', [script], { input: 'src/auth/login.tsx\n' }).toString();
  const r = JSON.parse(out);
  assert.equal(r.frontend, true);
  assert.equal(r.security, true);
});
