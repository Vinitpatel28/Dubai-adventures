import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ActivityModel from '@/models/Activity';
import AboutModel from '@/models/About';
import Media from '@/models/Media';

export async function POST() {
  await dbConnect();

  try {
    const activities = await ActivityModel.find({}).lean();
    const aboutData = await AboutModel.find({}).lean();
    const urls = new Set<string>();

    // Activity images
    activities.forEach((act: any) => {
      if (act.image && act.image.includes('cloudinary.com')) urls.add(act.image);
      if (act.gallery && Array.isArray(act.gallery)) {
        act.gallery.forEach((g: string) => {
          if (g && g.includes('cloudinary.com')) urls.add(g);
        });
      }
    });

    // About images
    aboutData.forEach((ab: any) => {
      if (ab.hero?.image && ab.hero.image.includes('cloudinary.com')) urls.add(ab.hero.image);
      if (ab.heritage?.image && ab.heritage.image.includes('cloudinary.com')) urls.add(ab.heritage.image);
      if (ab.fleet?.gallery && Array.isArray(ab.fleet.gallery)) {
        ab.fleet.gallery.forEach((g: string) => {
          if (g && g.includes('cloudinary.com')) urls.add(g);
        });
      }
    });

    let createdCount = 0;
    for (const url of urls) {
      const existing = await Media.findOne({ url });
      if (!existing) {
        // Extract publicId from URL
        // Example: .../v1234567/folder/image_name.jpg
        const parts = url.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        const fileName = fileNameWithExt.split('.')[0];
        
        // Find public_id (usually everything after /upload/v.../)
        const uploadIndex = parts.indexOf('upload');
        let publicId = fileName;
        if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
          // Join the parts after the version (v12345)
          publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
        }

        await Media.create({
          url,
          publicId,
          fileName: fileName,
          format: fileNameWithExt.split('.')[1] || 'jpg',
          size: 0,
          width: 0,
          height: 0
        });
        createdCount++;
      }
    }

    return NextResponse.json({ 
      message: 'Sync complete', 
      found: urls.size, 
      created: createdCount 
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ message: 'Sync failed' }, { status: 500 });
  }
}
