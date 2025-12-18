# OAuth2 + Email Setup

This is the canonical setup guide for Google OAuth2 and SMTP email configuration.

## Google OAuth2

1. Add `google_id` column (if not present):

```bash
node database/add_google_id.js
```

2. Create Google OAuth Client in Google Cloud Console:
- Authorized origin: `http://localhost:5000`
- Redirect URI: `http://localhost:5000/api/auth/google/callback`

3. Configure environment variables (recommended):

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## Email (OTP / verification)

Configure:

```env
EMAIL_USER=...
EMAIL_PASS=...
```


