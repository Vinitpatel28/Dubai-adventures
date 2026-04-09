import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { validateFileUpload } from '@/lib/validation';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// POST /api/upload  — upload image to Cloudinary (admin only)
export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 });

    // Validate file
    const fileValidation = validateFileUpload(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (!fileValidation.valid) {
      return NextResponse.json({ message: fileValidation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'dubai-adventures',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    await dbConnect();
    const media = await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    });

    return NextResponse.json({ 
      url: result.secure_url, 
      publicId: result.public_id,
      id: media._id 
    });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ message: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
