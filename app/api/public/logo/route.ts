import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Logo from '@/lib/models/Logo';

// GET - Fetch active logo for public use
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find the active logo
    const activeLogo = await Logo.findOne({ isActive: true });

    if (!activeLogo) {
      return NextResponse.json({ 
        logo: null,
        message: 'No active logo found'
      });
    }

    return NextResponse.json({ 
      logo: {
        imageUrl: activeLogo.imageUrl,
        altText: activeLogo.altText,
        width: activeLogo.width,
        height: activeLogo.height,
      }
    });
  } catch (error: any) {
    console.error('Error fetching active logo:', error);
    return NextResponse.json({ 
      logo: null,
      error: error.message || 'Failed to fetch logo' 
    }, { status: 500 });
  }
}
