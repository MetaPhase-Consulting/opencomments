# Environment Setup

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# For client-side (Vite) (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** Both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are required for custom migrations. The application will exit if these are not provided.

## Getting Your Supabase Keys

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings > API
4. Copy the following keys:
   - **Project URL** → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_KEY`

## Running Custom Migrations

To run custom migrations that require the service role key:

```bash
npm run db:custom-migrate
```

This requires both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables to be set.

## Security Notes

- **Never commit your `.env` file** to version control
- **The `.env` file is already in `.gitignore`**
- **Use the anon key for client-side code** (respects Row Level Security)
- **Use the service role key only for server-side operations** (bypasses RLS)
- **No hardcoded URLs or keys** are exposed in the codebase 