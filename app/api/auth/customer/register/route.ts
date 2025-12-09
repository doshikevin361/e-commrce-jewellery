import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, getCustomerByEmail, hashCustomerPassword } from '@/lib/models/customer';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, address } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone, and password are required' },
        { status: 400 }
      );
    }

    // Name validation
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Phone validation (Indian phone number format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    if (password.length > 50) {
      return NextResponse.json(
        { error: 'Password must be less than 50 characters' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await getCustomerByEmail(email);
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashCustomerPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 48); // 48 hours (increased from 24)
    
    console.log('[Customer Auth] Registration - Token expires at:', verificationExpires);

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create customer
    const customerId = await createCustomer({
      name,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      address: address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jewellery-commrce-824e.vercel.app'}/verify-email?token=${verificationToken}`;
    const emailTemplate = emailTemplates.verification(name, verificationLink);
    
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      customerId,
    }, { status: 201 });
  } catch (error) {
    console.error('[Customer Auth] Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}

