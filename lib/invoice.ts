import { connectDB, connectToDatabase } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import mongoose from 'mongoose';
import { sendEmail } from './email';

export async function generateInvoiceImage(order: any): Promise<{ imageBuffer: Buffer; vendor: any }> {
  const { db } = await connectToDatabase();

  // Get vendor information from products
  const vendorMap = new Map<string, any>();
  for (const item of order.items) {
    if (item.product) {
      const productId = typeof item.product === 'string' 
        ? new mongoose.Types.ObjectId(item.product)
        : item.product;
      
      const product = await db.collection('products').findOne({ _id: productId });
      if (product && product.vendor) {
        const vendorId = typeof product.vendor === 'string' 
          ? product.vendor 
          : product.vendor.toString();
        
        if (!vendorMap.has(vendorId)) {
          const vendor = await db.collection('vendors').findOne({ 
            _id: new mongoose.Types.ObjectId(vendorId) 
          });
          if (vendor) {
            vendorMap.set(vendorId, {
              _id: vendor._id.toString(),
              storeName: vendor.storeName || 'Unknown Vendor',
              email: vendor.email || '',
              phone: vendor.phone || '',
              address1: vendor.address1 || '',
              city: vendor.city || '',
              state: vendor.state || '',
              pinCode: vendor.pinCode || '',
              gstNumber: vendor.gstNumber || '',
            });
          }
        }
      }
    }
  }

  // Get the first vendor (or use default if no vendor)
  const vendor = vendorMap.size > 0 
    ? Array.from(vendorMap.values())[0]
    : {
        storeName: 'LuxeLoom Jewelry',
        email: 'support@luxeloom.com',
        phone: '',
        address1: '',
        city: '',
        state: '',
        pinCode: '',
        gstNumber: '',
      };

  // Generate invoice HTML
  const invoiceHtml = generateInvoiceHTML(order, vendor);

  // Convert HTML to image using Puppeteer
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 800, height: 1200 });
    
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    }) as Buffer;

    await browser.close();

    return { imageBuffer, vendor };
  } catch (puppeteerError) {
    await browser.close();
    throw puppeteerError;
  }
}

export async function generateAndSendInvoice(orderId: string, order: any, customerData: any) {
  try {
    // Generate invoice image
    const { imageBuffer, vendor } = await generateInvoiceImage(order);

    // Send invoice via email
    await sendInvoiceEmail(order, vendor, imageBuffer);

    return true;
  } catch (error) {
    console.error('[Invoice] Failed to generate and send invoice:', error);
    throw error;
  }
}

function generateInvoiceHTML(order: any, vendor: any): string {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          background: white;
          padding: 40px;
          color: #333;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #1F3B29;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1F3B29 0%, #C8A15B 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          padding: 30px;
          background: #f9f9f9;
          border-bottom: 2px solid #1F3B29;
        }
        .info-section {
          flex: 1;
        }
        .info-section h3 {
          color: #1F3B29;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 2px solid #C8A15B;
          padding-bottom: 5px;
        }
        .info-section p {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        .items-table th {
          background: #1F3B29;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }
        .items-table tr:hover {
          background: #f5f5f5;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .summary {
          padding: 30px;
          background: #f9f9f9;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }
        .summary-row.total {
          font-size: 20px;
          font-weight: bold;
          color: #1F3B29;
          border-top: 2px solid #1F3B29;
          padding-top: 15px;
          margin-top: 10px;
        }
        .footer {
          padding: 20px 30px;
          text-align: center;
          background: #1F3B29;
          color: white;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.orderId}</p>
        </div>
        
        <div class="invoice-info">
          <div class="info-section">
            <h3>Vendor Information</h3>
            <p><strong>${vendor.storeName}</strong></p>
            ${vendor.address1 ? `<p>${vendor.address1}</p>` : ''}
            ${vendor.city ? `<p>${vendor.city}, ${vendor.state} ${vendor.pinCode}</p>` : ''}
            ${vendor.phone ? `<p>Phone: ${vendor.phone}</p>` : ''}
            ${vendor.gstNumber ? `<p>GST: ${vendor.gstNumber}</p>` : ''}
          </div>
          <div class="info-section">
            <h3>Customer Information</h3>
            <p><strong>${order.customerName}</strong></p>
            <p>${order.customerEmail}</p>
            <p>${order.shippingAddress.fullName}</p>
            <p>${order.shippingAddress.addressLine1}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p>Phone: ${order.shippingAddress.phone}</p>
          </div>
        </div>

        <div style="padding: 0 30px;">
          <p style="margin: 20px 0 10px 0;"><strong>Order Date:</strong> ${orderDate}</p>
          <p style="margin-bottom: 20px;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Price</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.productName}</strong>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${item.subtotal.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-row">
              <span>Shipping Charges:</span>
              <span>₹${order.shippingCharges.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>₹${order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span>₹${order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendInvoiceEmail(order: any, vendor: any, imageBuffer: Buffer): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'parthlota113@gmail.com',
        pass: 'myutgfmuhrgphfkv',
      },
    });

    const mailOptions = {
      from: `"${vendor.storeName}" <parthlota113@gmail.com>`,
      to: order.customerEmail,
      subject: `Invoice for Order #${order.orderId} - ${vendor.storeName}`,
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
              <h1>Invoice for Order #${order.orderId}</h1>
            </div>
            <div class="content">
              <h2>Hello ${order.customerName}!</h2>
              <p>Your order has been delivered successfully. Please find your invoice attached.</p>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Total Amount:</strong> ₹${order.total.toLocaleString('en-IN')}</p>
              <p><strong>Vendor:</strong> ${vendor.storeName}</p>
              <p>Thank you for shopping with us!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${vendor.storeName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${order.orderId}-${vendor.storeName.replace(/\s+/g, '-')}.png`,
          content: imageBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('[Invoice] Invoice email sent to:', order.customerEmail);
    return true;
  } catch (error) {
    console.error('[Invoice] Failed to send invoice email:', error);
    return false;
  }
}

