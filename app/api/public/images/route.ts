import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Image from '../../../../models/Image';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build search query for extracted data
    let searchQuery = {};
    
    if (search.trim()) {
      // Search across multiple extracted data fields
      searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'extractedData.rawText': { $regex: search, $options: 'i' } },
          { 'extractedData.name': { $regex: search, $options: 'i' } },
          { 'extractedData.phoneNumber': { $regex: search, $options: 'i' } },
          { 'extractedData.address': { $regex: search, $options: 'i' } },
          { 'extractedData.otherText': { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get images with pagination
    const images = await Image.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Image.countDocuments(searchQuery);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}