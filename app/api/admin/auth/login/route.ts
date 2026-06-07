import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '../../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    
    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password required' },
        { status: 400 }
      );
    }

    // Get admin credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = '$2a$10$i2/LOfzguG4g2IbbZvBv2e/OOXdJcg.6KFJhGOyoYzzqyT4P56gSm';

    // Check if environment variables are configured
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Username match:', username === ADMIN_USERNAME);
    
    // Validate username
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password provided:', password);
    console.log('Stored password hash:', ADMIN_PASSWORD_HASH);
    
    // Verify password against the stored hash
    const isPasswordValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token with a fixed ID for admin
    const token = generateToken('admin');

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    });

    // Set cookie with proper options
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}