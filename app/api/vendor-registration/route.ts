import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashVendorPassword } from '@/lib/models/vendor';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['businessName', 'businessEmail', 'businessPhone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if vendor with email already exists
    const existingVendor = await db.collection('vendors').findOne({ email: body.businessEmail });
    if (existingVendor) {
      return NextResponse.json(
        { error: 'A vendor with this email already exists' },
        { status: 400 }
      );
    }

    // Generate username from business name
    const username = body.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + Math.floor(Math.random() * 1000);

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await hashVendorPassword(randomPassword);

    // Generate store slug from business name
    const storeSlug = body.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 10000);

    // Prepare vendor document
    const vendorData = {
      storeName: body.businessName,
      storeSlug: storeSlug,
      ownerName: body.supplierName || body.businessName,
      email: body.businessEmail,
      phone: body.businessPhone,
      alternatePhone: body.supplierPhone || '',
      whatsappNumber: '',
      businessType: 'individual' as const,
      gstNumber: body.hasGST ? body.gstin : '',
      panNumber: '',
      businessRegistrationNumber: '',
      description: `Jewellery vendor - ${body.businessName}`,
      address1: body.addressLine1,
      address2: body.addressLine2 || '',
      city: body.city,
      state: body.state,
      pinCode: body.pincode,
      country: 'India',
      bankName: body.bankName || '',
      accountHolderName: body.accountHolderName || '',
      accountNumber: body.accountNumber || '',
      ifscCode: body.ifscCode || '',
      upiId: '',
      logo: '',
      banner: '',
      commissionRate: 5, // Default 5% commission
      allowedCategories: [],
      facebook: '',
      instagram: '',
      twitter: '',
      website: '',
      idProof: '',
      addressProof: '',
      gstCertificate: '',
      cancelledCheque: '',
      status: 'pending' as const,
      approvalNotes: '',
      emailVerified: false,
      phoneVerified: false,
      documentsVerified: false,
      username: username,
      password: hashedPassword,
      sendCredentialsEmail: true,
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      // Store original registration data
      registrationData: {
        hasGST: body.hasGST,
        gstin: body.gstin || '',
        supplierEmail: body.supplierEmail || '',
        supplierPhone: body.supplierPhone || '',
      },
    };

    const result = await db.collection('vendors').insertOne(vendorData);

    // TODO: Send welcome email with credentials
    // For now, we'll just return success

    return NextResponse.json(
      { 
        success: true,
        message: 'Vendor registration submitted successfully. We will review your application and contact you soon.',
        vendorId: result.insertedId.toString(),
        // In production, don't send password in response. Send via email instead.
        // For demo purposes:
        credentials: {
          username: username,
          password: randomPassword,
          email: body.businessEmail,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[VendorRegistration] Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to submit vendor registration. Please try again.' },
      { status: 500 }
    );
  }
}
