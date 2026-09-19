# Nelson Computer Institute - Email OTP Setup

The student portal now supports:
- Student registration with email verification OTP.
- Student login with OTP sent only to the registered email.
- 6-digit OTP, 10-minute expiry, 5 verification attempts, and a 60-second resend cooldown.
- Admin and Branch login remain password-based.

## Production environment variables

Set these in Netlify (Site configuration -> Environment variables):

```env
DATABASE_URL=your-production-database-url
RESEND_API_KEY=your-resend-api-key
OTP_FROM_EMAIL=Nelson Computer Institute <your-verified-sender@example.com>
```

For Resend, verify the sending domain/email in your Resend account before using a custom sender. Do not commit the API key to GitHub.

## Database

Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

The new `OtpCode` table is added by Prisma. For a production deployment, use a persistent database (PostgreSQL/Supabase is recommended) instead of local SQLite because Netlify/serverless deployments should not rely on a local writable SQLite file.
