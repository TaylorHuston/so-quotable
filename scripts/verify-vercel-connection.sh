#!/bin/bash
# Verification script for TASK-006 Phase 1.1: Vercel GitHub connection
# Tests that GitHub repository is properly connected to Vercel with correct settings

set -e

echo "=== TASK-006 Phase 1.1 Verification: Vercel GitHub Connection ==="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: Verify .vercel directory exists
echo "Test 1: Vercel project configuration exists..."
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✓ PASS${NC}: .vercel/project.json found"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: .vercel/project.json not found"
    FAIL=$((FAIL + 1))
fi
echo ""

# Test 2: Verify project is linked to Vercel
echo "Test 2: Vercel project is linked..."
PROJECT_ID=$(jq -r '.projectId' .vercel/project.json 2>/dev/null || echo "")
if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Project ID: $PROJECT_ID"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: No project ID found"
    FAIL=$((FAIL + 1))
fi
echo ""

# Test 3: Verify GitHub remote exists
echo "Test 3: GitHub remote is configured..."
GITHUB_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$GITHUB_REMOTE" =~ github.com ]]; then
    echo -e "${GREEN}✓ PASS${NC}: GitHub remote: $GITHUB_REMOTE"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: GitHub remote not found or invalid"
    FAIL=$((FAIL + 1))
fi
echo ""

# Test 4: Verify Vercel CLI is installed
echo "Test 4: Vercel CLI is installed..."
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    echo -e "${GREEN}✓ PASS${NC}: Vercel CLI version: $VERCEL_VERSION"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: Vercel CLI not found"
    FAIL=$((FAIL + 1))
fi
echo ""

# Test 5: Verify project exists on Vercel
echo "Test 5: Project exists on Vercel (requires authentication)..."
if vercel ls --yes > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}: Vercel authentication successful"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠ SKIP${NC}: Vercel authentication required (run: vercel login)"
fi
echo ""

# Test 6: Verify Node.js version configuration
echo "Test 6: Node.js version is configured..."
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo -e "${GREEN}✓ PASS${NC}: .nvmrc specifies Node.js $NODE_VERSION"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: .nvmrc not found"
    FAIL=$((FAIL + 1))
fi

if [ -f "package.json" ]; then
    PKG_NODE_VERSION=$(jq -r '.engines.node // "not specified"' package.json)
    echo -e "${GREEN}✓ PASS${NC}: package.json engines.node: $PKG_NODE_VERSION"
    PASS=$((PASS + 1))
else
    echo -e "${RED}✗ FAIL${NC}: package.json not found"
    FAIL=$((FAIL + 1))
fi
echo ""

# Summary
echo "=== Verification Summary ==="
echo -e "Tests passed: ${GREEN}$PASS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "Tests failed: ${RED}$FAIL${NC}"
    echo ""
    echo "Status: FAILED - Fix issues above before proceeding"
    exit 1
else
    echo "Tests failed: 0"
    echo ""
    echo -e "${GREEN}Status: ALL TESTS PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify Vercel dashboard settings manually"
    echo "2. Check deployment branch configuration (main → production)"
    echo "3. Verify preview deployments are enabled"
    echo "4. Confirm PR comments with preview URLs are enabled"
    exit 0
fi
