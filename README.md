# pr-review: a Claude Code skill for careful code review

Author: Emmanuel Shola (github.com/kinu01)

## What it does

This skill makes Claude Code review the changes on your branch in a careful, structured way. It first writes down what the change is for, with small usage examples, before it reads any changed code. Then it reads the code and checks if the code matches that story. It sends the review to several fresh reviewer agents in parallel, each with its own group of categories. A separate "skeptic" agent then tries to prove each finding wrong, so false alarms are dropped and real problems stay. The report puts problems first, gives a concrete fix for each one, and ends with a clear verdict.

## The 18 review categories

1. Race conditions
2. Optimized DRY code (no repeated logic)
3. Efficient code
4. Not lazy code
5. No assumptions
6. Optimized queries
7. All edge cases covered
8. Missing tests
9. Complexity and separation of concerns
10. Questions we have not asked yet
11. Security
12. Code works as expected ("bet your life")
13. Implicit model surface changes
14. No lazy imports (only if your repo enforces it)
15. Helper re-entry and newly reachable code paths
16. Pattern alignment with the codebase
17. Validate the flow against real data (when possible)
18. Verification actions not yet taken

## How to install

Copy this folder to your Claude Code skills folder:

```bash
mkdir -p ~/.claude/skills
cp -R claude-pr-review-skill ~/.claude/skills/pr-review
```

Claude Code finds the skill the next time you start a session.

## How to run it

The skill has two modes.

1. Self-review before a PR. After you write the code and before you commit, ask Claude Code to run `/pr-review`. It reviews your branch against its base branch and gives you a report.
2. Reviewing a teammate's PR. Ask "pr-review for <name> <PR link>". Claude Code runs the same review, lists every finding for you first, and then turns the ones you pick into short inline comments. It shows you each comment one at a time, and it posts nothing until you approve it.

## Background

This skill grew out of my daily code review practice, and I measure which reviewer agents find real problems so I can keep improving it.

## License

MIT. See the LICENSE file.
