#!/usr/bin/env node
// Decides which reviewer agents a pull request needs, from its changed file paths alone.
// Usage: gh pr diff <n> --name-only | node scripts/route.mjs   (prints one JSON object)

const DOC_ONLY = /(\.(md|mdx|txt|rst|png|jpe?g|gif|svg|webp|ico)$)|(^|\/)(LICENSE|CHANGELOG|CODEOWNERS)$/i;

const FRONTEND_EXT = /\.(tsx|jsx|vue|svelte|css|scss|sass|less|html)$/i;
const FRONTEND_DIR = /(^|\/)(components|pages|app|hooks|ui|views|screens|styles|frontend|client)\//i;

const BACKEND_EXT = /\.(py|go|rb|java|kt|cs|php|rs|sql)$/i;
const BACKEND_DIR = /(^|\/)(api|server|backend|functions|lambdas?|services|migrations|workers|jobs)\//i;
const SCRIPT_EXT = /\.(ts|js|mjs|cjs)$/i;

const SECURITY = /(^|[\/._-])(auth|login|logout|session|token|oauth|jwt|password|permission|rbac|acl|payment|billing|checkout|stripe|webhook|secret|crypto|encrypt|sign)|(^|\/)\.env|(^|\/)Dockerfile$|(^|\/)\.github\/workflows\//i;

export function route(paths) {
  const files = [...new Set(paths.map((p) => p.trim()).filter(Boolean))];
  const reviewable = files.filter((f) => !DOC_ONLY.test(f));
  const frontend = [];
  const backend = [];
  const security = [];

  for (const f of reviewable) {
    const isBackendDir = BACKEND_DIR.test(f);
    if (FRONTEND_EXT.test(f) || (SCRIPT_EXT.test(f) && FRONTEND_DIR.test(f) && !isBackendDir)) {
      frontend.push(f);
    }
    if (BACKEND_EXT.test(f) || (SCRIPT_EXT.test(f) && isBackendDir)) {
      backend.push(f);
    }
    if (SECURITY.test(f)) {
      security.push(f);
    }
  }

  return {
    review: reviewable.length > 0,
    frontend: frontend.length > 0,
    backend: backend.length > 0,
    security: security.length > 0,
    files: { reviewable, frontend, backend, security },
  };
}

const isCli = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isCli) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => {
    process.stdout.write(JSON.stringify(route(input.split('\n'))) + '\n');
  });
}
