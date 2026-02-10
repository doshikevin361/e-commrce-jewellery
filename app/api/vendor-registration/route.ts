import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashVendorPassword } from '@/lib/models/vendor';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['businessName', 'businessEmail', 'businessPhone', 'addressLine1', 'city', 'state', 'pincode', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if vendor with email already exists
    const existingVendor = await db.collection('vendors').findOne({ email: body.businessEmail });
    if (existingVendor) {
      return NextResponse.json(
        { error: 'A vendor with this email already exists' },
        { status: 400 }
      );
    }

    // Generate username from business email (part before @)
    const emailPrefix = body.businessEmail.split('@')[0];
    const username = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) + Math.floor(Math.random() * 1000);

    // Hash the provided password
    const hashedPassword = await hashVendorPassword(body.password);

    // Generate store slug from business name
    const storeSlug = body.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 10000);

    // Build productTypeCommissions and allowedCategories from tabular rows
    const rows = Array.isArray(body.productCommissionRows) ? body.productCommissionRows : [];
    const productTypeCommissions: Record<string, number> = {};
    const allowedCategories: string[] = [];
    const allowedProductTypes: string[] = [];
    for (const row of rows) {
      const pt = (row.productType || '').toString().trim();
      const cat = (row.category || '').toString().trim();
      const commission = typeof row.vendorCommission === 'number' ? row.vendorCommission : parseFloat(row.vendorCommission) || 0;
      if (pt) {
        productTypeCommissions[pt] = commission;
        if (!allowedProductTypes.includes(pt)) allowedProductTypes.push(pt);
      }
      if (cat && !allowedCategories.includes(cat)) allowedCategories.push(cat);
    }
    const defaultCommission = 5;
    const commissionRate = Object.keys(productTypeCommissions).length > 0
      ? Math.round(Object.values(productTypeCommissions).reduce((a, b) => a + b, 0) / Object.keys(productTypeCommissions).length * 10) / 10
      : defaultCommission;

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
      commissionRate,
      productTypeCommissions: Object.keys(productTypeCommissions).length > 0 ? productTypeCommissions : undefined,
      allowedProductTypes: allowedProductTypes.length > 0 ? allowedProductTypes : undefined,
      allowedCategories,
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
      // Store original registration data including product/commission table
      registrationData: {
        hasGST: body.hasGST,
        gstin: body.gstin || '',
        supplierEmail: body.supplierEmail || '',
        supplierPhone: body.supplierPhone || '',
        productCommissionRows: rows,
      },
    };

    const result = await db.collection('vendors').insertOne(vendorData);

    return NextResponse.json(
      { 
        success: true,
        message: 'Vendor registration submitted successfully. Please wait for admin approval.',
        vendorId: result.insertedId.toString(),
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
