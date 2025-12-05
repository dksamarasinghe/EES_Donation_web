# Supabase Setup Guide for EES Society Website

This guide will walk you through setting up the Supabase backend for the EES Society website.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New Project"
5. Fill in project details:
   - **Name**: `ees-society` (or your preferred name)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose closest to Sri Lanka (e.g., Singapore)
   - **Pricing Plan**: Free tier is sufficient to start
6. Click "Create new project"
7. Wait for project initialization (2-3 minutes)

## Step 2: Run Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. Verify success - you should see "Success. No rows returned"

## Step 3: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `programs`
   - `program_images`
   - `donation_categories`
   - `donations`
   - `expenses`

## Step 4: Set Up Storage Buckets

The SQL schema should have created the storage buckets automatically. Verify:

1. Click on **Storage** in the left sidebar
2. You should see two buckets:
   - `program-images`
   - `expense-invoices`
3. Both should be set to **Public** (for viewing)

If the buckets weren't created, create them manually:
- Click "New bucket"
- Name: `program-images`, Public: ON
- Click "New bucket"
- Name: `expense-invoices`, Public: ON

## Step 5: Create Your First Admin User

1. Click on **Authentication** in the left sidebar
2. Click on **Users** tab
3. Click "Add user" → "Create new user"
4. Fill in:
   - **Email**: your-email@example.com
   - **Password**: Create a strong password
   - **Auto Confirm User**: ON (enable this)
5. Click "Create user"
6. Copy the **User UID** (UUID) that appears

Now make this user an admin:

1. Go back to **SQL Editor**
2. Run this query (replace with your user's UUID):

```sql
UPDATE public.users 
SET is_admin = TRUE 
WHERE id = 'your-user-uuid-here';
```

3. If you get "0 rows updated", first insert the user:

```sql
INSERT INTO public.users (id, email, full_name, is_admin)
VALUES ('your-user-uuid-here', 'your-email@example.com', 'Your Name', TRUE);
```

## Step 6: Get API Credentials

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** under Project Settings
3. Copy these values (you'll need them for Next.js):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys** → **anon public**: `eyJhbGc...` (long string)

Save these securely - you'll add them to your Next.js `.env.local` file.

## Step 7: Configure RLS Policies (Verification)

The schema already includes Row Level Security policies. To verify:

1. Go to **Authentication** → **Policies**
2. Select each table and verify policies exist
3. If any are missing, refer back to the SQL schema file

## Environment Variables for Next.js

Once your Supabase project is ready, create a `.env.local` file in your Next.js project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing Your Setup

Run this query in SQL Editor to test:

```sql
-- Test query
SELECT * FROM public.users WHERE is_admin = TRUE;
```

You should see your admin user listed.

## Common Issues

### Issue: "relation public.users does not exist"
**Solution**: Run the SQL schema again. Make sure you're in the SQL Editor and the entire schema is pasted.

### Issue: Storage buckets not created
**Solution**: Create them manually in Storage section, then run the storage policy SQL separately.

### Issue: Can't insert into users table
**Solution**: The users table is tied to Supabase Auth. Users are automatically added when they sign up. For the first admin, you may need to insert manually as shown in Step 5.

## Next Steps

After completing this setup:
1. Proceed to Next.js project initialization
2. Configure Supabase client in your Next.js app
3. Start building the frontend

## Security Notes

- **Never commit** your `SUPABASE_ANON_KEY` to public repositories (though it's designed to be public-facing)
- Keep your **Database Password** and **Service Role Key** completely private
- The `anon` key is safe to use in frontend code - RLS policies protect your data
- Always use RLS policies for data access control
