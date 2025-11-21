#!/bin/bash
#
# Configure GitHub branch protection rules for main and develop branches
# Requires: gh CLI authenticated (run `gh auth login` first)
#
# Purpose: Automate Phase 4.3 - Set up PR protection rules
# - Require E2E tests to pass before merge
# - Require code review approval
# - Block merges when checks fail

set -e

REPO_OWNER="TaylorHuston"
REPO_NAME="so-quoteable"

echo "=== Setting up GitHub Branch Protection Rules ==="
echo ""
echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo ""

# Function to configure branch protection
configure_branch_protection() {
  local BRANCH=$1
  echo "Configuring protection for branch: ${BRANCH}"

  # Create branch protection rule via GitHub API using proper JSON
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}/protection" \
    --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["e2e-preview", "test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF

  echo "✅ Branch protection configured for: ${BRANCH}"
  echo ""
}

# Configure main branch
echo "=== Configuring main branch ==="
configure_branch_protection "main"

# Configure develop branch
echo "=== Configuring develop branch ==="
configure_branch_protection "develop"

echo "=== Branch Protection Rules Setup Complete ==="
echo ""
echo "✅ Both main and develop branches now require:"
echo "   - E2E tests (e2e-preview) to pass"
echo "   - Unit tests (test) to pass"
echo "   - 1 approving review before merge"
echo "   - Linear history (no merge commits)"
echo "   - Conversation resolution"
echo ""
echo "📋 To verify, visit:"
echo "   https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
echo ""
echo "🧪 Next: Test the workflow by creating a PR (Phase 4.4)"
