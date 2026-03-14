# Supabase Setup Guide

This application supports Supabase for cloud database storage. Follow these steps to set it up:

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free, no credit card required)
3. Create a new project
   - Choose a project name (e.g., "work-order-timeline")
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

## Step 2: Get Your Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Your App

1. Open `src/environments/environment.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxxxxxxxxxx.supabase.co', // Your Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Your anon key
  },
};
```

3. Do the same for `src/environments/environment.prod.ts` (for production builds)

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the following SQL and click "Run":

```sql
-- Create work_centers table
CREATE TABLE work_centers (
  id BIGSERIAL PRIMARY KEY,
  "docId" TEXT UNIQUE NOT NULL,
  "docType" TEXT NOT NULL DEFAULT 'workCenter',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_orders table
CREATE TABLE work_orders (
  id BIGSERIAL PRIMARY KEY,
  "docId" TEXT UNIQUE NOT NULL,
  "docType" TEXT NOT NULL DEFAULT 'workOrder',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_work_centers_docId ON work_centers("docId");
CREATE INDEX idx_work_orders_docId ON work_orders("docId");

-- Enable Row Level Security (RLS)
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON work_centers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON work_centers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON work_centers
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON work_centers
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON work_orders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON work_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON work_orders
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON work_orders
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 5: Enable Realtime (Optional but Recommended)

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the `work_orders` table in the list
3. Click the toggle to enable replication
4. Do the same for `work_centers` table

This enables real-time updates across all connected clients!

## Step 6: Run Your App

1. Start your development server:
   ```bash
   npm start
   ```

2. The app will automatically:
   - Connect to Supabase
   - Seed the database with sample data (if empty)
   - Sync all changes to the cloud
   - Subscribe to real-time updates

## Fallback Mode

If you don't configure Supabase (leave the placeholder values), the app will automatically fall back to using `localStorage` for data persistence.

## Security Notes

⚠️ **Important**: The current setup allows public read/write access to your tables. For production use, you should:

1. Implement proper authentication (Supabase Auth)
2. Update the Row Level Security policies to restrict access based on authenticated users
3. Consider adding user-specific data isolation

## Troubleshooting

### "Failed to load work orders from Supabase"

- Check that your URL and anon key are correct
- Verify the tables were created successfully
- Check browser console for detailed error messages

### Data not syncing in real-time

- Ensure replication is enabled for both tables
- Check the browser console for subscription errors
- Verify your Supabase project is active (free tier projects pause after inactivity)

### Tables not found

- Re-run the SQL script from Step 4
- Verify you're connected to the correct Supabase project

## Benefits of Using Supabase

✅ Data persists across devices and browsers
✅ Real-time synchronization
✅ Automatic backups
✅ No server management required
✅ Free tier includes 500MB database
✅ Easy to scale when needed

Enjoy your cloud-powered work order timeline! 🚀
