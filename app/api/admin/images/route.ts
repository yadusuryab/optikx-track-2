// app/api/admin/images/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Image from '../../../../models/Image';

export async function GET() {
  try {
    await connectToDatabase();
    const images = await Image.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Image ID is required' },
        { status: 400 }
      );
    }

    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    await Image.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete image' },
      { status: 500 }
    );
  }
}