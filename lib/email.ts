import nodemailer from 'nodemailer';

const mailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'parthlota113@gmail.com',
    pass: 'myutgfmuhrgphfkv',
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransport(mailConfig);

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('[Email] SMTP configuration error:', error);
  } else {
    console.log('[Email] SMTP server is ready to send messages');
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"LuxeLoom Jewelry" <${mailConfig.auth.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  verification: (name: string, verificationLink: string) => ({
    subject: 'Verify Your Email Address - LuxeLoom Jewelry',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #C8A15B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LuxeLoom Jewelry</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for creating an account with us. Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #C8A15B;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'Reset Your Password - LuxeLoom Jewelry',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #C8A15B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #C8A15B;">${resetLink}</p>
            <div class="warning">
              <strong>Important:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
              <strong>Security Note:</strong> For your account security, password reset links are only valid for 1 hour. If the link expires, you can request a new one from the login page.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordChanged: (name: string) => ({
    subject: 'Password Changed Successfully - LuxeLoom Jewelry',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <div class="success">
              <strong>Success!</strong> Your password has been changed successfully.
            </div>
            <p>If you didn't make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (name: string) => ({
    subject: 'Welcome to LuxeLoom Jewelry!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LuxeLoom!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for joining LuxeLoom Jewelry! We're excited to have you as part of our community.</p>
            <p>Start exploring our exquisite collection of jewelry and find the perfect piece for you.</p>
            <p>Happy shopping!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderConfirmation: (orderData: {
    orderId: string;
    customerName: string;
    items: Array<{ productName: string; quantity: number; price: number; subtotal: number }>;
    subtotal: number;
    shippingCharges: number;
    tax: number;
    total: number;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    orderStatus: string;
    createdAt: string;
  }) => ({
    subject: `Order Confirmation - ${orderData.orderId} | LuxeLoom Jewelry`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #C8A15B; }
          .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .item-row:last-child { border-bottom: none; }
          .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; border-top: 2px solid #1F3B29; margin-top: 10px; }
          .address-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .status-badge { display: inline-block; padding: 5px 15px; background: #28a745; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Hello ${orderData.customerName}!</h2>
            <p>We're excited to confirm your order. Your order has been received and is being processed.</p>
            
            <div class="order-info">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Status:</strong> <span class="status-badge">${orderData.orderStatus}</span></p>
            </div>

            <div class="order-info">
              <h3 style="margin-top: 0;">Order Items</h3>
              ${orderData.items.map(item => `
                <div class="item-row">
                  <div>
                    <strong>${item.productName}</strong><br>
                    <small>Quantity: ${item.quantity} × ₹${item.price.toLocaleString()}</small>
                  </div>
                  <div><strong>₹${item.subtotal.toLocaleString()}</strong></div>
                </div>
              `).join('')}
              <div class="item-row">
                <div>Subtotal</div>
                <div>₹${orderData.subtotal.toLocaleString()}</div>
              </div>
              <div class="item-row">
                <div>Shipping Charges</div>
                <div>₹${orderData.shippingCharges.toLocaleString()}</div>
              </div>
              <div class="item-row">
                <div>Tax</div>
                <div>₹${orderData.tax.toLocaleString()}</div>
              </div>
              <div class="total-row">
                <div>Total Amount</div>
                <div>₹${orderData.total.toLocaleString()}</div>
              </div>
            </div>

            <div class="address-box">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p>
                ${orderData.shippingAddress.fullName}<br>
                ${orderData.shippingAddress.addressLine1}${orderData.shippingAddress.addressLine2 ? ', ' + orderData.shippingAddress.addressLine2 : ''}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}<br>
                Phone: ${orderData.shippingAddress.phone}
              </p>
            </div>

            <p>We'll send you another email when your order ships. You can track your order status anytime from your account.</p>
            <p>If you have any questions, please don't hesitate to contact our customer support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderStatusUpdate: (orderData: {
    orderId: string;
    customerName: string;
    orderStatus: string;
    trackingNumber?: string;
    items: Array<{ productName: string; quantity: number }>;
    total: number;
  }) => {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared for shipment.',
        color: '#28a745',
      },
      processing: {
        title: 'Order Processing',
        message: 'Your order is being processed and will be shipped soon.',
        color: '#17a2b8',
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Great news! Your order has been shipped and is on its way to you.',
        color: '#007bff',
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been delivered! We hope you love your purchase.',
        color: '#28a745',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact support.',
        color: '#dc3545',
      },
    };

    const statusInfo = statusMessages[orderData.orderStatus.toLowerCase()] || {
      title: 'Order Status Updated',
      message: `Your order status has been updated to ${orderData.orderStatus}.`,
      color: '#6c757d',
    };

    return {
      subject: `${statusInfo.title} - Order ${orderData.orderId} | LuxeLoom Jewelry`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; }
            .status-badge { display: inline-block; padding: 8px 20px; background: ${statusInfo.color}; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
            .tracking-box { background: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #b3d9ff; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.title}</h1>
            </div>
            <div class="content">
              <h2>Hello ${orderData.customerName}!</h2>
              
              <div class="status-box">
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Status:</strong> <span class="status-badge">${orderData.orderStatus}</span></p>
                <p style="margin-top: 15px;">${statusInfo.message}</p>
              </div>

              ${orderData.trackingNumber ? `
                <div class="tracking-box">
                  <h3 style="margin-top: 0;">Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                  <p>You can use this tracking number to track your shipment on the courier's website.</p>
                </div>
              ` : ''}

              <p>Order Summary:</p>
              <ul>
                ${orderData.items.map(item => `<li>${item.productName} (Qty: ${item.quantity})</li>`).join('')}
              </ul>
              <p><strong>Total Amount:</strong> ₹${orderData.total.toLocaleString()}</p>

              <p>You can view your order details and track its progress anytime from your account.</p>
              <p>If you have any questions, please don't hesitate to contact our customer support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} LuxeLoom Jewelry. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },
};

