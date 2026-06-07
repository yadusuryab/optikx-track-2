// Update the dashboard stats API to include extracted data statistics
// app/api/admin/upload/stats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import Image from '../../../../../models/Image';

export async function GET() {
  try {
    await connectToDatabase();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalImages,
      recentUploads,
      imagesWithText,
      imagesWithName,
      imagesWithPhone,
      imagesWithAddress
    ] = await Promise.all([
      Image.countDocuments(),
      Image.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Image.countDocuments({ 'extractedData.rawText': { $ne: '' } }),
      Image.countDocuments({ 'extractedData.name': { $ne: '' } }),
      Image.countDocuments({ 'extractedData.phoneNumber': { $ne: '' } }),
      Image.countDocuments({ 'extractedData.address': { $ne: '' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalImages,
        recentUploads,
        imagesWithText,
        imagesWithName,
        imagesWithPhone,
        imagesWithAddress,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}