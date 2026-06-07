import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (decoded) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}