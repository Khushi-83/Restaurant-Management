import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

export async function POST(request: Request) {
  try {
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

    const fileName = `${uuidv4()}.${fileExtension}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // First, ensure the bucket exists and is public
    const { error: bucketError } = await supabase.storage.createBucket('menu-images', {
      public: true,
      allowedMimeTypes: ALLOWED_FILE_TYPES,
      fileSizeLimit: MAX_FILE_SIZE
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('Bucket creation error:', bucketError);
      return NextResponse.json({ error: 'Storage configuration error' }, { status: 500 });
    }

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: uploadError.message 
      }, { status: 500 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName);

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