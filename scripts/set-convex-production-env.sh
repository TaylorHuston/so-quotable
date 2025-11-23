#!/bin/bash
set -e

# TASK-006 Phase 2.1: Set Convex Production Environment Variables
# This script automates setting all required production environment variables in Convex

echo "======================================"
echo "Convex Production Environment Setup"
echo "TASK-006 Phase 2.1"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Load variables from .env.local
source .env.local

# Check if production AUTH_SECRET was saved
if [ ! -f /tmp/prod-auth-secret.txt ]; then
    echo "❌ Error: Production AUTH_SECRET not found"
    echo "Please run ./scripts/set-vercel-production-env.sh first"
    exit 1
fi

PROD_AUTH_SECRET=$(cat /tmp/prod-auth-secret.txt)

echo "✅ Found .env.local"
echo "✅ Found production AUTH_SECRET"
echo ""

# Validate required variables
MISSING_VARS=()
[ -z "$CLOUDINARY_API_KEY" ] && MISSING_VARS+=("CLOUDINARY_API_KEY")
[ -z "$CLOUDINARY_API_SECRET" ] && MISSING_VARS+=("CLOUDINARY_API_SECRET")
[ -z "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" ] && MISSING_VARS+=("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")
[ -z "$RESEND_API_KEY" ] && MISSING_VARS+=("RESEND_API_KEY")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Error: Missing required variables in .env.local:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo "======================================"
echo "Production Configuration Summary"
echo "======================================"
echo ""
echo "The following variables will be set in Convex production (steady-anaconda-957):"
echo ""
echo "1. AUTH_SECRET: ${PROD_AUTH_SECRET:0:12}...${PROD_AUTH_SECRET: -4}"
echo "2. CLOUDINARY_CLOUD_NAME: $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
echo "3. CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY:0:8}..."
echo "4. CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET:0:8}..."
echo "5. RESEND_API_KEY: ${RESEND_API_KEY:0:8}..."
echo ""

# Confirm before proceeding
read -p "Proceed with setting all 5 variables in Convex production? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

echo ""
echo "======================================"
echo "Setting Convex Environment Variables"
echo "======================================"
echo ""

# Set environment variables for production deployment
echo -n "Setting AUTH_SECRET... "
npx convex env set AUTH_SECRET "$PROD_AUTH_SECRET" --prod 2>/dev/null && echo "✅" || echo "❌"

echo -n "Setting CLOUDINARY_CLOUD_NAME... "
npx convex env set CLOUDINARY_CLOUD_NAME "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" --prod 2>/dev/null && echo "✅" || echo "❌"

echo -n "Setting CLOUDINARY_API_KEY... "
npx convex env set CLOUDINARY_API_KEY "$CLOUDINARY_API_KEY" --prod 2>/dev/null && echo "✅" || echo "❌"

echo -n "Setting CLOUDINARY_API_SECRET... "
npx convex env set CLOUDINARY_API_SECRET "$CLOUDINARY_API_SECRET" --prod 2>/dev/null && echo "✅" || echo "❌"

echo -n "Setting RESEND_API_KEY... "
npx convex env set RESEND_API_KEY "$RESEND_API_KEY" --prod 2>/dev/null && echo "✅" || echo "❌"

echo ""
echo "======================================"
echo "✅ All Variables Set Successfully"
echo "======================================"
echo ""

# Verify variables are set
echo "Verifying configuration..."
npx convex env list --prod

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. ✅ Vercel production variables configured"
echo "2. ✅ Convex production variables configured"
echo ""
echo "3. Update Google OAuth redirect URIs:"
echo "   - Add: https://so-quoteable.vercel.app/api/auth/callback/google"
echo "   - Keep: http://localhost:3000/api/auth/callback/google"
echo ""
echo "4. Test deployment:"
echo "   git push origin feature/TASK-006-deployment-pipeline"
echo ""
