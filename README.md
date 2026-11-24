# pr-review

Author: Emmanuel Shola (github.com/kinu01)

pr-review is a careful code reviewer for pull requests, built on Claude. It runs in two places:

1. **On every pull request, as a GitHub Action.** It reads which files changed and picks the reviewers that fit: frontend checks for React and CSS files, backend checks for API, database and job code, and a security pass on auth, payment, webhook and workflow files. Then a skeptic agent tries to prove each finding wrong. Only the findings that survive are posted, as inline comments plus one summary with a verdict.
2. **In Claude Code on your own machine,** as a skill you run before you commit.

## Why skeptics

AI reviewers are confident, and confident-but-wrong comments waste a reviewer's time. So every finding goes to a separate skeptic agent that sees the claim and the code but not the finder's reasoning. Its only job is to refute the finding by tracing the real code path. A refuted finding is not posted as a comment. It is listed in the summary under "Considered and dismissed" with the line that disproves it, so nothing disappears silently.

## Use it as a GitHub Action

1. Add one secret to your repository, under Settings, Secrets and variables, Actions:
   - **With a Claude Pro or Max plan:** run `claude setup-token` on your computer and save the token as `CLAUDE_CODE_OAUTH_TOKEN`. Reviews then count against your plan, with no API bill.
   - **With an Anthropic API account:** save your API key as `ANTHROPIC_API_KEY`. Reviews are billed to that account.
2. Copy [`examples/pr-review.yml`](examples/pr-review.yml) to `.github/workflows/pr-review.yml`. It passes whichever secret you set.

That's it. The next pull request gets a review.

| Input | Default | What it does |
|---|---|---|
| `claude_code_oauth_token` | | A Pro or Max sign-in token from `claude setup-token`. |
| `anthropic_api_key` | | An Anthropic API key. Set this or the token. |
| `model` | `claude-opus-5-5` | The Claude model that runs the review. Set `claude-sonnet-5-5` for lower cost. |
| `depth` | `full` | `full`: a skeptic checks every finding. `quick`: skeptics only on high-severity findings, which costs less. |
| `max_turns` | `60` | An upper limit on agent turns, to cap cost. |

A pull request that changes only docs or images gets a one-line comment and no Claude run, so it costs nothing.

**Safety.** The reviewer is read-only: it can read the diff and files, and it can comment, but it cannot edit, commit or push. It never runs the pull request's code. By default it does not run on pull requests from forks. Text inside the pull request is treated as data to review, never as instructions.

Built on Anthropic's [claude-code-action](https://github.com/anthropics/claude-code-action), which handles triggers, sign-in and posting comments. pr-review adds the file router, the review categories, the reviewer and skeptic agents, and the verdict format.

## Use it in Claude Code

```
/plugin install pr-review --marketplace kinu01/claude-pr-review-skill
```

Then ask Claude Code to run `/pr-review` after you write code and before you commit. To review a teammate's pull request, ask "pr-review for <name> <PR link>". It lists every finding for you first, then drafts short inline comments and posts nothing until you approve each one.

## The 20 review categories

**Correctness:** 1 race conditions, 5 no assumptions, 7 edge cases, 10 questions we have not asked yet, 12 code works as expected.

**Quality:** 2 no repeated logic, 3 efficient code, 4 not lazy code, 9 complexity and separation of concerns, 16 pattern alignment with the codebase.

**Security and surface:** 11 security, mapped to the OWASP Top 10 and the OWASP API Security Top 10 (every security finding names its OWASP item), 13 implicit model surface changes, 15 newly reachable code paths.

**Tests and performance:** 6 optimized queries, 8 missing tests, 14 no lazy imports (only if your repo enforces it), 17 validate against real data (local runs only).

**Frontend:** 19 accessibility (names, keyboard, focus, announcements, zoom, with the WCAG criterion), 20 React rendering and state (re-renders, effects, stale closures, keys, widgets that should mount once).

**Meta:** 18 verification actions not yet taken. Every review lists what it did not check, so you know where its confidence ends.

## How it decides which reviewers run

`scripts/route.mjs` reads the changed file paths and returns which reviewers a pull request needs. It is plain Node with no dependencies, and its tests run with `npm test`.

## License

MIT. See the LICENSE file.
