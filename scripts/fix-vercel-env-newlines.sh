#!/bin/bash
#
# Fix embedded newlines in Vercel environment variables
# Bug: `echo "value" | vercel env add` includes the newline in the value
# Fix: Use `printf "value"` instead

set -e

echo "=== Fixing Production Environment Variables ==="

# Read from local .env.local
if [ ! -f .env.local ]; then
  echo "Error: .env.local not found"
  exit 1
fi

source .env.local

# Remove and re-add each variable WITHOUT newline
# Production variables
echo "Fixing AUTH_SECRET..."
PROD_AUTH_SECRET=$(openssl rand -base64 32)
vercel env rm AUTH_SECRET production --yes >/dev/null 2>&1 || true
printf "%s" "$PROD_AUTH_SECRET" | vercel env add AUTH_SECRET production >/dev/null

echo "Fixing CLOUDINARY_API_KEY..."
vercel env rm CLOUDINARY_API_KEY production --yes >/dev/null 2>&1 || true
printf "%s" "$CLOUDINARY_API_KEY" | vercel env add CLOUDINARY_API_KEY production >/dev/null

echo "Fixing CLOUDINARY_API_SECRET..."
vercel env rm CLOUDINARY_API_SECRET production --yes >/dev/null 2>&1 || true
printf "%s" "$CLOUDINARY_API_SECRET" | vercel env add CLOUDINARY_API_SECRET production >/dev/null

echo "Fixing GOOGLE_CLIENT_ID..."
vercel env rm GOOGLE_CLIENT_ID production --yes >/dev/null 2>&1 || true
printf "%s" "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production >/dev/null

echo "Fixing GOOGLE_CLIENT_SECRET..."
vercel env rm GOOGLE_CLIENT_SECRET production --yes >/dev/null 2>&1 || true
printf "%s" "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production >/dev/null

echo "Fixing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME..."
vercel env rm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production --yes >/dev/null 2>&1 || true
printf "%s" "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" | vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production >/dev/null

echo "Fixing RESEND_API_KEY..."
vercel env rm RESEND_API_KEY production --yes >/dev/null 2>&1 || true
printf "%s" "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production >/dev/null

echo ""
echo "✅ Production variables fixed (without embedded newlines)"
echo "⚠️  Note: Generated new AUTH_SECRET for production"
echo "    Saved to: /tmp/prod-auth-secret-fixed.txt"
echo "$PROD_AUTH_SECRET" > /tmp/prod-auth-secret-fixed.txt

echo ""
echo "=== Fixing Preview Environment Variables ==="

# Preview uses dev Convex URL
DEV_CONVEX_URL="$NEXT_PUBLIC_CONVEX_URL"

echo "Fixing preview AUTH_SECRET..."
vercel env rm AUTH_SECRET preview --yes >/dev/null 2>&1 || true
printf "%s" "$PROD_AUTH_SECRET" | vercel env add AUTH_SECRET preview >/dev/null

echo "Fixing preview CLOUDINARY_API_KEY..."
vercel env rm CLOUDINARY_API_KEY preview --yes >/dev/null 2>&1 || true
printf "%s" "$CLOUDINARY_API_KEY" | vercel env add CLOUDINARY_API_KEY preview >/dev/null

echo "Fixing preview CLOUDINARY_API_SECRET..."
vercel env rm CLOUDINARY_API_SECRET preview --yes >/dev/null 2>&1 || true
printf "%s" "$CLOUDINARY_API_SECRET" | vercel env add CLOUDINARY_API_SECRET preview >/dev/null

echo "Fixing preview GOOGLE_CLIENT_ID..."
vercel env rm GOOGLE_CLIENT_ID preview --yes >/dev/null 2>&1 || true
printf "%s" "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID preview >/dev/null

echo "Fixing preview GOOGLE_CLIENT_SECRET..."
vercel env rm GOOGLE_CLIENT_SECRET preview --yes >/dev/null 2>&1 || true
printf "%s" "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET preview >/dev/null

echo "Fixing preview NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME..."
vercel env rm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME preview --yes >/dev/null 2>&1 || true
printf "%s" "$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" | vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME preview >/dev/null

echo "Fixing preview RESEND_API_KEY..."
vercel env rm RESEND_API_KEY preview --yes >/dev/null 2>&1 || true
printf "%s" "$RESEND_API_KEY" | vercel env add RESEND_API_KEY preview >/dev/null

echo ""
echo "✅ Preview variables fixed (without embedded newlines)"
echo ""
echo "=== Next Steps ==="
echo "1. Update Convex production environment with new AUTH_SECRET:"
echo "   npx convex env set AUTH_SECRET \"\$(cat /tmp/prod-auth-secret-fixed.txt)\" --prod"
echo "2. Redeploy to production:"
echo "   vercel deploy --prod"
echo "3. Test health endpoint:"
echo "   curl https://so-quoteable.vercel.app/api/health"
