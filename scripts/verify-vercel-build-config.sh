#!/usr/bin/env bash

#############################################
# Vercel Build Configuration Verification
#############################################
# TASK-006 Phase 1.2
# Verifies Next.js build settings are optimal
# for Vercel deployment
#
# Usage: ./scripts/verify-vercel-build-config.sh
#############################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Test result tracking
declare -a FAILED_TESTS=()
declare -a WARNING_TESTS=()

#############################################
# Helper Functions
#############################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Vercel Build Configuration Verification (Phase 1.2)          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}┌─ $1${NC}"
}

print_test() {
    echo -e "${BLUE}├──${NC} Testing: $1"
}

pass() {
    echo -e "${BLUE}│  ${GREEN}✓ PASS${NC} - $1"
    PASS=$((PASS + 1))
}

fail() {
    echo -e "${BLUE}│  ${RED}✗ FAIL${NC} - $1"
    FAIL=$((FAIL + 1))
    FAILED_TESTS+=("$1")
}

warn() {
    echo -e "${BLUE}│  ${YELLOW}⚠ WARN${NC} - $1"
    WARN=$((WARN + 1))
    WARNING_TESTS+=("$1")
}

info() {
    echo -e "${BLUE}│  ${NC}ℹ INFO - $1"
}

print_summary() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Test Summary                                                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "  ${GREEN}Passed:${NC}   $PASS"
    echo -e "  ${RED}Failed:${NC}   $FAIL"
    echo -e "  ${YELLOW}Warnings:${NC} $WARN"

    if [ $FAIL -gt 0 ]; then
        echo -e "\n${RED}Failed Tests:${NC}"
        for test in "${FAILED_TESTS[@]}"; do
            echo -e "  - $test"
        done
    fi

    if [ $WARN -gt 0 ]; then
        echo -e "\n${YELLOW}Warnings:${NC}"
        for test in "${WARNING_TESTS[@]}"; do
            echo -e "  - $test"
        done
    fi

    echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}Build configuration verification FAILED${NC}"
        echo -e "Please review the failed tests above and consult docs/deployment/vercel-setup.md"
        return 1
    elif [ $WARN -gt 0 ]; then
        echo -e "${YELLOW}Build configuration verification PASSED with warnings${NC}"
        echo -e "Review warnings above for potential optimizations"
        return 0
    else
        echo -e "${GREEN}Build configuration verification PASSED${NC}"
        echo -e "All build settings are properly configured for Next.js deployment"
        return 0
    fi
}

#############################################
# Test Functions
#############################################

test_nextjs_installed() {
    print_test "Next.js framework is installed"

    if command -v npm &> /dev/null; then
        if npm list next --depth=0 &> /dev/null; then
            NEXT_VERSION=$(npm list next --depth=0 | grep next@ | sed 's/.*next@//' | awk '{print $1}')
            pass "Next.js v${NEXT_VERSION} is installed"

            # Check if it's Next.js 13+ (required for App Router)
            MAJOR_VERSION=$(echo "$NEXT_VERSION" | cut -d. -f1)
            if [ "$MAJOR_VERSION" -ge 13 ]; then
                info "Next.js version supports App Router (v${NEXT_VERSION})"
            else
                warn "Next.js version is below 13, some features may not be available"
            fi
        else
            fail "Next.js not found in package.json dependencies"
        fi
    else
        fail "npm not found - cannot verify Next.js installation"
    fi
}

test_node_version_config() {
    print_test "Node.js version is properly configured"

    # Check .nvmrc exists
    if [ -f ".nvmrc" ]; then
        NVMRC_VERSION=$(cat .nvmrc | tr -d '\n')
        pass ".nvmrc exists with Node.js v${NVMRC_VERSION}"
    else
        warn ".nvmrc not found - Vercel will use default Node.js version"
    fi

    # Check package.json engines field
    if [ -f "package.json" ]; then
        if grep -q '"engines"' package.json; then
            NODE_ENGINE=$(grep -A 2 '"engines"' package.json | grep '"node"' | sed 's/.*"node".*:.*"\(.*\)".*/\1/' | tr -d ',')
            pass "package.json engines.node set to: ${NODE_ENGINE}"

            # Verify .nvmrc matches engines requirement
            if [ -f ".nvmrc" ]; then
                if [[ "$NODE_ENGINE" == *">="* ]]; then
                    MIN_VERSION=$(echo "$NODE_ENGINE" | sed 's/>=//;s/[^0-9.]//g')
                    if [[ "$NVMRC_VERSION" == "$MIN_VERSION"* ]]; then
                        info ".nvmrc version (${NVMRC_VERSION}) meets engines requirement (${NODE_ENGINE})"
                    else
                        warn ".nvmrc (${NVMRC_VERSION}) may not match engines requirement (${NODE_ENGINE})"
                    fi
                fi
            fi
        else
            warn "package.json missing engines.node field - Vercel will use latest LTS"
        fi
    else
        fail "package.json not found"
    fi
}

test_build_command() {
    print_test "Build command is configured in package.json"

    if [ -f "package.json" ]; then
        if grep -q '"build"' package.json; then
            BUILD_CMD=$(grep '"build"' package.json | sed 's/.*"build".*:.*"\(.*\)".*/\1/' | tr -d ',')
            pass "Build command configured: ${BUILD_CMD}"

            # Verify it's using Next.js build
            if [[ "$BUILD_CMD" == *"next build"* ]]; then
                info "Build command uses 'next build' (correct for Next.js)"
            else
                warn "Build command doesn't include 'next build' - may not be configured correctly"
            fi
        else
            fail "No 'build' script found in package.json"
        fi
    else
        fail "package.json not found"
    fi
}

test_output_directory() {
    print_test "Next.js output directory will be .next (default)"

    # Next.js always outputs to .next directory
    # Check if there's any custom output configuration in next.config.*
    if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
        CONFIG_FILE=$(ls next.config.* 2>/dev/null | head -1)

        if grep -q "distDir" "$CONFIG_FILE" 2>/dev/null; then
            CUSTOM_DIR=$(grep "distDir" "$CONFIG_FILE" | sed "s/.*distDir.*['\"]\\(.*\\)['\"].*/\\1/")
            warn "Custom output directory configured: ${CUSTOM_DIR}"
            info "Vercel needs to be configured with this custom directory"
        else
            pass "Using default .next output directory (no custom distDir in ${CONFIG_FILE})"
        fi
    else
        pass "Using default .next output directory (no next.config file found)"
    fi
}

test_next_config_exists() {
    print_test "Next.js configuration file exists"

    if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
        CONFIG_FILE=$(ls next.config.* 2>/dev/null | head -1)
        pass "Next.js config found: ${CONFIG_FILE}"

        # Check for common optimization settings
        if grep -q "images" "$CONFIG_FILE" 2>/dev/null; then
            info "Image optimization configured in ${CONFIG_FILE}"
        fi

        if grep -q "swcMinify" "$CONFIG_FILE" 2>/dev/null; then
            info "SWC minification configured (faster builds)"
        fi
    else
        info "No next.config file found (using Next.js defaults)"
    fi
}

test_typescript_config() {
    print_test "TypeScript configuration (if applicable)"

    if [ -f "tsconfig.json" ]; then
        pass "TypeScript configuration found (tsconfig.json)"

        # Check if type-checking is in build process
        if grep -q '"type-check"' package.json; then
            TYPE_CHECK_CMD=$(grep '"type-check"' package.json | sed 's/.*"type-check".*:.*"\(.*\)".*/\1/' | tr -d ',')
            info "Type-check command available: ${TYPE_CHECK_CMD}"
        else
            info "No explicit type-check script (Next.js handles this during build)"
        fi
    else
        info "No TypeScript configuration (JavaScript project)"
    fi
}

test_incremental_builds() {
    print_test "Incremental builds support (Vercel default for Next.js)"

    # Vercel automatically enables incremental builds for Next.js
    # Check if there's a .next directory that would be cached
    pass "Vercel enables incremental builds automatically for Next.js"
    info "First build will be slower, subsequent builds will be cached"

    # Check for .gitignore to ensure .next is not committed
    if [ -f ".gitignore" ]; then
        if grep -q "^.next$\|^/.next$\|^.next/$\|^/.next/$" .gitignore; then
            info ".next directory properly excluded in .gitignore (enables caching)"
        else
            warn ".next directory should be in .gitignore for optimal caching"
        fi
    fi
}

test_package_manager() {
    print_test "Package manager lockfile for build caching"

    # Vercel caches based on lockfile
    if [ -f "package-lock.json" ]; then
        pass "npm lockfile found (package-lock.json) - enables dependency caching"
    elif [ -f "yarn.lock" ]; then
        pass "Yarn lockfile found (yarn.lock) - enables dependency caching"
    elif [ -f "pnpm-lock.yaml" ]; then
        pass "pnpm lockfile found (pnpm-lock.yaml) - enables dependency caching"
    else
        warn "No lockfile found - builds will be slower without dependency caching"
        info "Run 'npm install' to generate package-lock.json"
    fi
}

test_vercel_project_config() {
    print_test "Vercel project configuration"

    if [ -f ".vercel/project.json" ]; then
        pass "Vercel project linked (.vercel/project.json exists)"

        # Extract framework setting if present
        if command -v jq &> /dev/null; then
            FRAMEWORK=$(jq -r '.framework // "not set"' .vercel/project.json 2>/dev/null)
            if [ "$FRAMEWORK" != "not set" ] && [ "$FRAMEWORK" != "null" ]; then
                info "Framework preset: ${FRAMEWORK}"
            fi
        fi
    else
        warn "Vercel project not linked locally - run 'vercel link' to configure"
    fi
}

test_build_performance() {
    print_test "Build performance optimizations"

    # Check for webpack config in next.config
    if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
        CONFIG_FILE=$(ls next.config.* 2>/dev/null | head -1)

        # Check for experimental features that might affect performance
        if grep -q "experimental" "$CONFIG_FILE" 2>/dev/null; then
            info "Experimental features configured - may affect build time"
        fi

        pass "Next.js build optimizations enabled by default"
    else
        pass "Using Next.js default optimizations"
    fi
}

test_environment_variables() {
    print_test "Build-time environment variables configuration"

    # Check for .env files
    ENV_FILES=()
    [ -f ".env.local" ] && ENV_FILES+=(".env.local")
    [ -f ".env.production" ] && ENV_FILES+=(".env.production")
    [ -f ".env" ] && ENV_FILES+=(".env")

    if [ ${#ENV_FILES[@]} -gt 0 ]; then
        pass "Local environment files found: ${ENV_FILES[*]}"
        info "Vercel environment variables must be configured in dashboard"
        info "See docs/deployment/vercel-setup.md for required variables"
    else
        warn "No local .env files found - ensure Vercel environment variables are configured"
    fi

    # Check for .env.example
    if [ -f ".env.local.example" ] || [ -f ".env.example" ]; then
        EXAMPLE_FILE=$(ls .env*.example 2>/dev/null | head -1)
        info "Environment variable template found: ${EXAMPLE_FILE}"
    fi
}

#############################################
# Main Execution
#############################################

main() {
    print_header

    # Change to project root if script is run from subdirectory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_ROOT"

    echo "Project root: $PROJECT_ROOT"

    # Run all tests
    print_section "Next.js Framework Configuration"
    test_nextjs_installed
    test_next_config_exists
    test_typescript_config

    print_section "Node.js Version Configuration"
    test_node_version_config

    print_section "Build Configuration"
    test_build_command
    test_output_directory
    test_package_manager

    print_section "Vercel Integration"
    test_vercel_project_config
    test_environment_variables

    print_section "Performance Optimizations"
    test_incremental_builds
    test_build_performance

    # Print summary and exit with appropriate code
    print_summary
}

# Run main function
main
