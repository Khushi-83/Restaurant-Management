import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

// Allowed image types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Handle GET requests
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Environment sanity checks
    const urlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const keyPresent = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!urlPresent || !keyPresent) {
      return NextResponse.json({
        error: 'Supabase environment not configured',
        details: 'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set and restart the dev server.'
      }, { status: 500 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
      }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file extension. Allowed extensions: jpg, jpeg, png, webp, gif' 
      }, { status: 400 });
    }

    const fileName = `uploads/${uuidv4()}.${fileExtension}`;

    // Ensure the bucket exists
    const { data: bucketInfo } = await supabaseServer.storage.getBucket('menu-images');
    if (!bucketInfo) {
      // Try to create (requires service role)
      const { error: bucketError } = await supabaseServer.storage.createBucket('menu-images', {
        public: true,
      });
      if (bucketError && !/already exists/i.test(bucketError.message)) {
        console.warn('Bucket create warning:', bucketError.message);
      }

      // Re-check existence
      const { data: bucketInfoAfter } = await supabaseServer.storage.getBucket('menu-images');
      if (!bucketInfoAfter) {
        return NextResponse.json({
          error: "Storage bucket 'menu-images' not found.",
          details: "Create the bucket in Supabase Storage and make it Public, or set SUPABASE_SERVICE_ROLE_KEY in your environment so the API can create it automatically."
        }, { status: 500 });
      }
    }

    // Upload file
    const { error: uploadError } = await supabaseServer.storage
      .from('menu-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: uploadError.message || String(uploadError)
      }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseServer.storage
      .from('menu-images')
      .getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
} 