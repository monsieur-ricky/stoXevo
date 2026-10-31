#!/usr/bin/env bash
set -euo pipefail

# Run only after all five branch checkpoints have passed their quality gates.
# Creates review requests; never enables auto-merge or merges any branch.
cd "$(dirname "$0")/.."
gh auth status

bases=(main improvement/angular-optimus-update improvement/angular-21-bridge improvement/optimus-ui improvement/angular-22)
heads=(improvement/angular-optimus-update improvement/angular-21-bridge improvement/optimus-ui improvement/angular-22 improvement/angular-modernization)
files=(01-baseline 02-angular-21 03-optimus-ui 04-angular-22 05-modernization)
titles=(
  'chore: migration baseline and testing trophy quality gates'
  'chore: upgrade to Angular 21 compatibility bridge'
  'feat: replace PrimeNG with Optimus UI'
  'chore: upgrade to Angular 22 and Optimus UI 2'
  'refactor: modern Angular APIs and integration regression coverage'
)

for i in "${!heads[@]}"; do
  existing=$(gh pr list --repo monsieur-ricky/stoXevo --head "${heads[$i]}" --base "${bases[$i]}" --state open --json url --jq '.[0].url // empty')
  if [[ -n "$existing" ]]; then
    echo "$existing"
  else
    gh pr create --repo monsieur-ricky/stoXevo --head "${heads[$i]}" --base "${bases[$i]}" \
      --title "${titles[$i]}" --body-file "docs/pull-requests/${files[$i]}.md"
  fi
done
