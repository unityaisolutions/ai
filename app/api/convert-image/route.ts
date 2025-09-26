import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get('url');
  const format = searchParams.get('format') || 'webp';
  const size = searchParams.get('size') || 'large';
  const download = searchParams.get('download') === 'true';

  if (!blobUrl) {
    return NextResponse.json({ error: 'Missing blob URL' }, { status: 400 });
  }

  if (!['webp', 'jpg', 'png'].includes(format)) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  }

  try {
    // Fetch the original image from Vercel Blob
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // Determine dimensions based on size param
    let width, height;
    if (size === 'large') {
      width = 1024;
      height = 1024;
    } else {
      width = 512;
      height = 512;
    }

    // Convert and resize using sharp
    const processedImage = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toFormat(format as any);

    const imageBuffer = await processedImage.toBuffer();
    const contentType = `image/${format === 'jpg' ? 'jpeg' : format}`;

    if (download) {
      return new NextResponse(Uint8Array.from(imageBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="generated-image.${format}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // For preview, return inline image
    return new NextResponse(Uint8Array.from(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Vary': 'format,size',
      },
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    return NextResponse.json({ error: 'Image conversion failed' }, { status: 500 });
  }
}