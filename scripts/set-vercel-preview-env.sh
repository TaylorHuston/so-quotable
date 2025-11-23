#!/bin/bash
set -e

# TASK-006 Phase 2.2: Set Vercel Preview Environment Variables
# This script automates setting all required preview environment variables

echo "======================================"
echo "Vercel Preview Environment Setup"
echo "TASK-006 Phase 2.2"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with your development environment variables first."
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Load variables from .env.local
source .env.local

# Validate required variables exist in .env.local
MISSING_VARS=()
[ -z "$NEXT_PUBLIC_CONVEX_URL" ] && MISSING_VARS+=("NEXT_PUBLIC_CONVEX_URL")
[ -z "$AUTH_SECRET" ] && MISSING_VARS+=("AUTH_SECRET")
[ -z "$CLOUDINARY_API_KEY" ] && MISSING_VARS+=("CLOUDINARY_API_KEY")
[ -z "$CLOUDINARY_API_SECRET" ] && MISSING_VARS+=("CLOUDINARY_API_SECRET")
[ -z "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" ] && MISSING_VARS+=("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
[ -z "$GOOGLE_CLIENT_ID" ] && MISSING_VARS+=("GOOGLE_CLIENT_ID")
[ -z "$GOOGLE_CLIENT_SECRET" ] && MISSING_VARS+=("GOOGLE_CLIENT_SECRET")
[ -z "$RESEND_API_KEY" ] && MISSING_VARS+=("RESEND_API_KEY")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Error: Missing required variables in .env.local:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo "✅ All required variables found in .env.local"
echo ""

echo "======================================"
echo "Preview Configuration Summary"
echo "======================================"
echo ""
echo "The following variables will be set in Vercel (Preview environment only):"
echo ""
echo "1. NEXT_PUBLIC_CONVEX_URL: $NEXT_PUBLIC_CONVEX_URL (dev deployment)"
echo "2. AUTH_SECRET: ${AUTH_SECRET:0:12}... (same as dev)"
echo "3. CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY:0:8}..."
echo "4. CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET:0:8}..."
echo "5. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
echo "6. GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "7. GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:12}..."
echo "8. RESEND_API_KEY: ${RESEND_API_KEY:0:8}..."
echo ""
echo "📝 Note: Preview deployments will use dev Convex backend to keep production data separate"
echo ""

# Confirm before proceeding
echo "======================================"
echo "Ready to Set Variables"
echo "======================================"
echo ""
read -p "Proceed with setting all 8 variables in Vercel preview? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

echo ""
echo "======================================"
echo "Setting Vercel Environment Variables"
echo "======================================"
echo ""

# Function to set variable with error handling
set_vercel_env() {
    local var_name=$1
    local var_value=$2

    echo -n "Setting $var_name... "
    if echo "$var_value" | vercel env add "$var_name" preview 2>/dev/null; then
        echo "✅"
    else
        echo "⚠️  (may already exist, updating...)"
        # Try to remove and re-add if it already exists
        vercel env rm "$var_name" preview --yes 2>/dev/null || true
        if echo "$var_value" | vercel env add "$var_name" preview 2>/dev/null; then
            echo "   ✅ Updated"
        else
            echo "   ❌ Failed"
            return 1
        fi
    fi
}

# Set all variables for preview environment
set_vercel_env "NEXT_PUBLIC_CONVEX_URL" "$NEXT_PUBLIC_CONVEX_URL"
set_vercel_env "AUTH_SECRET" "$AUTH_SECRET"
set_vercel_env "CLOUDINARY_API_KEY" "$CLOUDINARY_API_KEY"
set_vercel_env "CLOUDINARY_API_SECRET" "$CLOUDINARY_API_SECRET"
set_vercel_env "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
set_vercel_env "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
set_vercel_env "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
set_vercel_env "RESEND_API_KEY" "$RESEND_API_KEY"

echo ""
echo "======================================"
echo "✅ All Variables Set Successfully"
echo "======================================"
echo ""

echo "======================================"
echo "Verification"
echo "======================================"
echo ""
echo "Listing all environment variables:"
vercel env ls

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. ✅ Vercel production variables configured (Phase 2.1)"
echo "2. ✅ Vercel preview variables configured (Phase 2.2)"
echo ""
echo "3. Test preview deployment:"
echo "   git push origin feature/TASK-006-deployment-pipeline"
echo ""
echo "4. Verify preview deployment uses dev Convex backend:"
echo "   - Check preview URL from Vercel deployment"
echo "   - Verify app connects to: https://cheery-cow-298.convex.cloud"
echo ""
echo "5. Proceed to Phase 2.3:"
echo "   - Configure GitHub Secrets for CI/CD"
echo "   - CONVEX_DEPLOY_KEY (for automated backend deployments)"
echo ""
