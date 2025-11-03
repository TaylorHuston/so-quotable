# OAuth Manual Testing Guide (Phase 3)

This guide provides step-by-step instructions for manually testing the Google OAuth integration.

## Prerequisites

1. ✅ Google OAuth credentials configured in `.env.local`
2. ✅ Google OAuth credentials added to Convex Dashboard
3. ✅ Convex Auth configured with Google provider in `convex/auth.ts`
4. ✅ Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Test Scenarios

### Scenario 1: New User Sign-Up with Google OAuth

**Objective**: Verify that new users can register using Google OAuth.

**Steps**:
1. Start development servers:
   ```bash
   # Terminal 1: Start Convex backend
   npx convex dev

   # Terminal 2: Start Next.js frontend
   npm run dev
   ```

2. Navigate to: `http://localhost:3000` (when frontend is implemented)

3. Click "Sign in with Google" button (Phase 4)

4. **Expected**: Redirected to Google OAuth consent screen

5. Select Google account and grant permissions (email, profile)

6. **Expected**: Redirected back to `http://localhost:3000/api/auth/callback/google`

7. **Expected**: User is authenticated and redirected to dashboard

8. Verify user created in Convex Dashboard:
   - Go to https://dashboard.convex.dev
   - Select project: so-quotable
   - Navigate to: Data → users table
   - **Expected fields**:
     - `email`: User's Google email
     - `name`: User's Google name
     - `slug`: Generated from email (e.g., "john-doe")
     - `role`: "user"
     - `emailVerificationTime`: Timestamp (auto-verified for OAuth)
     - `image`: Google profile picture URL

### Scenario 2: Existing Email/Password User Links Google OAuth

**Objective**: Verify that existing email/password users can link their Google account.

**Steps**:
1. Create user with email/password:
   ```bash
   # Via frontend (Phase 4) or via Convex function
   # Email: test@example.com
   # Password: SecurePass123!
   ```

2. Sign out

3. Click "Sign in with Google"

4. Select Google account with **same email** (test@example.com)

5. **Expected**: Accounts are linked (same user record updated)

6. Verify in Convex Dashboard:
   - User record should have:
     - Original `email`, `name`, `slug` preserved
     - `emailVerificationTime`: Now set (via OAuth)
     - `image`: Google profile picture added
     - All previous quotes/generated images preserved

### Scenario 3: OAuth State Parameter (CSRF Protection)

**Objective**: Verify that Convex Auth validates OAuth state parameter.

**Manual Test** (Advanced):
1. Initiate OAuth flow normally
2. In browser DevTools, capture the OAuth redirect URL with `state` parameter
3. Attempt to replay the callback with invalid/missing state
4. **Expected**: Convex Auth rejects the callback with error

**Note**: This is automatically handled by Convex Auth. Our tests document this behavior.

### Scenario 4: Email Case-Insensitivity

**Objective**: Verify account linking works regardless of email case.

**Steps**:
1. Create user: `user@example.com` (lowercase)
2. Sign in with Google using: `USER@EXAMPLE.COM` (uppercase)
3. **Expected**: Accounts linked (same user record)

### Scenario 5: Profile Picture from Google

**Objective**: Verify Google profile picture is stored and displayed.

**Steps**:
1. Sign in with Google OAuth
2. Verify in Convex Dashboard:
   - `image` field contains: `https://lh3.googleusercontent.com/...`
3. (Phase 4) Verify profile picture displayed in UI

## Testing Checklist

- [ ] New user can sign up with Google OAuth
- [ ] User profile created correctly (email, name, slug, role)
- [ ] Email verification automatic for OAuth users (`emailVerificationTime` set)
- [ ] Profile picture from Google stored correctly
- [ ] Existing email/password user can link Google account
- [ ] Account linking preserves original user data
- [ ] Case-insensitive email matching works
- [ ] OAuth state parameter validated (CSRF protection via Convex Auth)
- [ ] Session created after successful OAuth
- [ ] User can sign out and sign in again with Google

## Troubleshooting

### Error: "Redirect URI mismatch"

**Cause**: Redirect URI in Google Cloud Console doesn't match Convex callback URL.

**Solution**:
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Ensure redirect URI exactly matches:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Save and wait 5 minutes for Google to propagate changes

### Error: "Invalid OAuth credentials"

**Cause**: `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set or incorrect.

**Solution**:
1. Verify in `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
   ```
2. Verify in Convex Dashboard: Settings → Environment Variables
3. Restart `npx convex dev` to reload environment variables

⚠️ **SECURITY WARNING**: Never commit actual credentials to version control or documentation.

### Error: "OAuth state parameter invalid"

**Cause**: CSRF protection triggered (state mismatch).

**Solution**: This is expected behavior if OAuth flow is replayed or tampered with. Start fresh OAuth flow.

### Error: "Email already in use"

**Behavior**: If Google email matches existing email/password user:
- **Expected**: Accounts are linked automatically (Convex Auth behavior)
- **Action**: No error - accounts should merge

## Automated Testing

Phase 3 includes 15 automated tests in `convex/oauth.test.ts`:
- ✅ Profile mapping (email, name, slug, image)
- ✅ Email verification automatic for OAuth
- ✅ Account linking (existing email → Google OAuth)
- ✅ New user creation
- ✅ Case-insensitive email matching
- ✅ CSRF protection (state parameter)
- ✅ Profile data sanitization
- ✅ Edge cases (collisions, data preservation)

Run tests:
```bash
npm test -- oauth.test.ts
```

## Security Notes

1. **CSRF Protection**: Convex Auth automatically generates and validates OAuth `state` parameter
2. **HTTPS Required**: Production OAuth requires HTTPS (localhost HTTP is allowed for development)
3. **Scope Limitation**: Only requests `email`, `profile`, `openid` scopes (minimal permissions)
4. **Email Verification**: OAuth users are auto-verified (Google confirms email ownership)
5. **Profile Picture URL**: Stored as-is (XSS prevention happens at rendering time in frontend)

## Next Steps (Phase 4)

After manual testing confirms OAuth works:
1. Implement frontend auth UI components
2. Add "Sign in with Google" button
3. Display user profile with Google picture
4. Implement protected routes
5. Handle auth loading states

---

**Phase 3 Status**: Implementation complete, pending manual testing after Phase 4 frontend.
**Test Coverage**: 217 tests passing, 15 OAuth-specific tests.
