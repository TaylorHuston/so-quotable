#!/bin/bash
set -e

# TASK-006 Phase 2.1: Set Vercel Production Environment Variables
# This script automates setting all required production environment variables

echo "======================================"
echo "Vercel Production Environment Setup"
echo "TASK-006 Phase 2.1"
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

# Production Convex URL (from npx convex deploy output)
PROD_CONVEX_URL="https://steady-anaconda-957.convex.cloud"

echo "======================================"
echo "Production Configuration Summary"
echo "======================================"
echo ""
echo "The following variables will be set in Vercel (Production environment only):"
echo ""
echo "1. NEXT_PUBLIC_CONVEX_URL: $PROD_CONVEX_URL"
echo "2. AUTH_SECRET: <will be generated>"
echo "3. CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY:0:8}..."
echo "4. CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET:0:8}..."
echo "5. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
echo "6. GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "7. GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:0:12}..."
echo "8. RESEND_API_KEY: ${RESEND_API_KEY:0:8}..."
echo ""

# Generate new AUTH_SECRET for production
echo "======================================"
echo "Generate Production AUTH_SECRET"
echo "======================================"
echo ""
echo "⚠️  SECURITY: Production AUTH_SECRET must be different from development"
echo ""
echo "Generating new AUTH_SECRET..."
PROD_AUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Generated: ${PROD_AUTH_SECRET:0:12}...${PROD_AUTH_SECRET: -4}"
echo ""

# Confirm before proceeding
echo "======================================"
echo "Ready to Set Variables"
echo "======================================"
echo ""
read -p "Proceed with setting all 8 variables in Vercel production? (yes/no): " CONFIRM

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
    if echo "$var_value" | vercel env add "$var_name" production 2>/dev/null; then
        echo "✅"
    else
        echo "⚠️  (may already exist, updating...)"
        # Try to remove and re-add if it already exists
        vercel env rm "$var_name" production --yes 2>/dev/null || true
        if echo "$var_value" | vercel env add "$var_name" production 2>/dev/null; then
            echo "   ✅ Updated"
        else
            echo "   ❌ Failed"
            return 1
        fi
    fi
}

# Set all variables
set_vercel_env "NEXT_PUBLIC_CONVEX_URL" "$PROD_CONVEX_URL"
set_vercel_env "AUTH_SECRET" "$PROD_AUTH_SECRET"
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

# Save AUTH_SECRET for Convex setup
echo "📝 Saving production AUTH_SECRET for Convex setup..."
echo "$PROD_AUTH_SECRET" > /tmp/prod-auth-secret.txt
chmod 600 /tmp/prod-auth-secret.txt

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. ✅ Vercel production variables configured"
echo ""
echo "2. Set Convex production variables:"
echo "   - Go to: https://dashboard.convex.dev/deployment/steady-anaconda-957/settings/environment-variables"
echo "   - Set these 5 variables:"
echo "     • AUTH_SECRET (saved to /tmp/prod-auth-secret.txt)"
echo "     • CLOUDINARY_CLOUD_NAME"
echo "     • CLOUDINARY_API_KEY"
echo "     • CLOUDINARY_API_SECRET"
echo "     • RESEND_API_KEY"
echo ""
echo "3. Update Google OAuth redirect URIs:"
echo "   - Add: https://so-quoteable.vercel.app/api/auth/callback/google"
echo ""
echo "4. Verify configuration:"
echo "   vercel env ls"
echo ""
echo "5. Trigger test deployment:"
echo "   git push origin feature/TASK-006-deployment-pipeline"
echo ""

# Show AUTH_SECRET one more time
echo "======================================"
echo "Production AUTH_SECRET"
echo "======================================"
echo ""
echo "Copy this value for Convex setup:"
echo "$PROD_AUTH_SECRET"
echo ""
echo "Also saved to: /tmp/prod-auth-secret.txt"
echo ""
