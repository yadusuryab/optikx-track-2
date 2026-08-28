// app/api/admin/images/upload/route.ts
import { uploadToCloudinary } from '@/lib/cloudinary';
import { connectToDatabase } from '@/lib/mongodb';
import { extractTextFromImage } from '@/lib/vision';
import Image from '@/models/Image';
import { AnyAaaaRecord } from 'dns';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    // DB connection
    try {
      await connectToDatabase();
    } catch (dbError: any) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const tags = formData.get('tags') as string;

    // Validation
    if (!file)                            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ success: false, message: 'File must be an image' }, { status: 400 });

    // Buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer: Buffer<ArrayBuffer> = Buffer.from(arrayBuffer as ArrayBuffer);
    let processedBuffer: Buffer<ArrayBuffer> = originalBuffer;
    const maxSize = 1 * 1024 * 1024;

    // OCR reads best off a sharp source — but the free OCR.space key hard-caps
    // uploads at 1MB, and a request over that limit fails outright (this was
    // the actual cause of "not read" on larger photos, not orientation).
    // Sharpen for legibility, then shrink to fit the 1MB ceiling.
    const ocrMaxSize = 1 * 1024 * 1024;
    let ocrBuffer: any = await sharp(originalBuffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .sharpen()
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    if (ocrBuffer.length > ocrMaxSize) {
      let quality = 85;
      let dim = 1800;
      while (ocrBuffer.length > ocrMaxSize && (quality >= 40 || dim >= 1000)) {
        ocrBuffer = await sharp(originalBuffer)
          .resize(dim, dim, { fit: 'inside', withoutEnlargement: true })
          .sharpen()
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        if (ocrBuffer.length <= ocrMaxSize) break;
        quality -= 10;
        if (quality < 40) { quality = 85; dim -= 200; }
      }
    }

    // Compress the storage copy if needed (unrelated to the OCR copy above)
    if (processedBuffer.length > maxSize) {
      let quality = 85;
      let compressed :any= processedBuffer;

      while (quality >= 50 && compressed.length > maxSize) {
        compressed = await sharp(originalBuffer)
          .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
        if (compressed.length <= maxSize) break;
        quality -= 10;
      }
      processedBuffer = compressed;
    }

    if (processedBuffer.length > maxSize) {
      return NextResponse.json({
        success: false,
        message: `Image too large after compression (${Math.round(processedBuffer.length / 1024)}KB)`,
      }, { status: 400 });
    }

    // ── OCR first — use name as title ──────────────────────────────────────
    let extractedData = {
      rawText: '', name: '', phoneNumber: '', alternatePhone: '',
      address: '', landmark: '', city: '', district: '', state: '',
      pincode: '', trackingId: '', courier: '', trackingUrl: '', otherText: '',
    };

    try {
      extractedData = await extractTextFromImage(ocrBuffer);
      console.log('✅ OCR done:', {
        name: extractedData.name,
        phone: extractedData.phoneNumber,
        city: extractedData.city,
        tracking: extractedData.trackingId,
      });
      if (!extractedData.name && !extractedData.phoneNumber && !extractedData.pincode) {
        console.warn('⚠️ OCR returned no structured fields for this upload — check image quality/orientation.');
      }
    } catch (ocrError: any) {
      console.warn('⚠️ OCR failed, continuing without extraction:', ocrError.message);
    }

    // Use recipient name as title, fallback to filename
    const title = extractedData.name?.trim() || file.name.replace(/\.[^/.]+$/, '');

    // ── Cloudinary upload ──────────────────────────────────────────────────
    const base64Data = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;
    let cloudinaryResult: any;

    try {
      cloudinaryResult = await uploadToCloudinary(base64Data);
    } catch (cloudinaryError: any) {
      return NextResponse.json({ success: false, message: 'Failed to upload to cloud storage' }, { status: 500 });
    }

    const { publicId, url, width, height, format } = cloudinaryResult;
    const fileSize = cloudinaryResult.bytes || processedBuffer.length;

    if (!publicId || !url) {
      throw new Error('Cloudinary response missing publicId or url');
    }

    // ── Build tags ─────────────────────────────────────────────────────────
    const baseTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['package', 'dtdc'];
    const autoTags = [
      extractedData.state?.toLowerCase(),
      extractedData.city?.toLowerCase(),
      extractedData.district?.toLowerCase(),
      extractedData.courier?.toLowerCase(),
    ].filter(Boolean) as string[];

    const tagList = [...new Set([...baseTags, ...autoTags])];

    // ── Save to DB ─────────────────────────────────────────────────────────
    const imageDoc = new Image({
      title,
      description: extractedData.address || extractedData.otherText || title || 'No description available',
      publicId,
      url,
      width,
      height,
      format,
      bytes: fileSize,
      extractedData,
      documentType: 'package_label',   // hardcoded — no wasted OCR call
      tags: tagList,
      uploadedBy: 'admin',
    });

    await imageDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Package uploaded and processed',
      data: {
        id:             imageDoc._id,
        title:          imageDoc.title,
        url:            imageDoc.url,
        name:           extractedData.name,
        phone:          extractedData.phoneNumber,
        city:           extractedData.city,
        state:          extractedData.state,
        pincode:        extractedData.pincode,
        trackingId:     extractedData.trackingId,
        courier:        extractedData.courier,
        trackingUrl:    extractedData.trackingUrl,
      },
    });

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    return NextResponse.json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}