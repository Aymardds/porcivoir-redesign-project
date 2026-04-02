import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser
const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim();
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log("Setting up Supabase Storage...");
  
  // 1. Create the bucket if it doesn't exist
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const bucketName = 'product-images';
  const exists = buckets.find(b => b.name === bucketName);

  if (!exists) {
    console.log(`Creating bucket: ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    });
    if (createError) throw createError;
    console.log("Bucket created successfully.");
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
  }

  // 2. We can't easily create Storage Policies via the API (they are SQL-based)
  // but since it's a PUBLIC bucket, it should work for reads.
  // For WRITES, we need a policy. I'll provide the SQL.
  console.log("\nSetup complete. To allow uploads, PLEASE RUN THIS SQL IN SUPABASE:");
  console.log(`
-- Allow public uploads to product-images
CREATE POLICY \"Public Upload\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
-- Allow public read access
CREATE POLICY \"Public Access\" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  `);
}

setupStorage().catch(console.error);
