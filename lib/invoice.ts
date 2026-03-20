import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { launchInvoiceBrowser } from '@/lib/puppeteer-launch';
import type { InvoiceViewType, InvoiceEnrichedItem, InvoiceCompanyInfo, InvoiceOrderPayload } from './invoice-types';

const INVOICE_NUMBER_PREFIX = 'INV';
const DEFAULT_COMPANY = {
  name: 'JewelManas',
  email: process.env.EMAIL_USER || 'support@luxeloom.com',
  phone: '',
  address1: '',
  city: '',
  state: '',
  pinCode: '',
  gstNumber: '',
};

/** Resolve company/vendor info for the invoice (from first product's vendor or default). */
export async function getInvoiceCompanyInfo(order: any): Promise<InvoiceCompanyInfo> {
  const { db } = await connectToDatabase();
  const vendorMap = new Map<string, InvoiceCompanyInfo>();

  for (const item of order.items || []) {
    const productId = item.product?.toString?.() || item.product;
    if (!productId) continue;
    try {
      const product = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
      if (product?.vendor) {
        const vid = typeof product.vendor === 'string' ? product.vendor : product.vendor.toString();
        if (!vendorMap.has(vid)) {
          const vendor = await db.collection('vendors').findOne({ _id: new mongoose.Types.ObjectId(vid) });
          if (vendor) {
            vendorMap.set(vid, {
              name: vendor.storeName || 'Vendor',
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
    } catch (_) {}
  }

  const first = vendorMap.size > 0 ? Array.from(vendorMap.values())[0] : null;
  return first || DEFAULT_COMPANY;
}

/** Get metal type, purity, weight, making charges from product (jewellery fields). */
function getProductJewelleryFields(product: any): { metalType: string; purity: string; weight: number; makingCharges: number; taxRate: number } {
  const p = product || {};
  let metalType = 'N/A';
  let purity = '';
  let weight = 0;
  let makingCharges = Number(p.jewelleryMakingCharges) || Number(p.makingCharges) || 0;
  const taxRate = Math.max(0, Number(p.taxRate) ?? 3) / 100;

  if (p.hasGold) {
    metalType = 'Gold';
    purity = p.goldPurity || p.metalPurity || p.jewelleryPurity || '';
    weight = Number(p.jewelleryWeight) || Number(p.metalWeight) || Number(p.goldWeight) || 0;
    if (!makingCharges && p.makingChargePerGram) makingCharges = weight * Number(p.makingChargePerGram);
  } else if (p.hasSilver) {
    metalType = 'Silver';
    purity = p.silverPurity || p.metalPurity || p.jewelleryPurity || '';
    weight = Number(p.jewelleryWeight) || Number(p.metalWeight) || Number(p.silverWeight) || 0;
    if (!makingCharges && p.makingChargePerGram) makingCharges = weight * Number(p.makingChargePerGram);
  } else if (p.diamonds?.length) {
    const d = p.diamonds[0];
    metalType = d.metalType || 'Diamond';
    purity = d.metalPurity || '';
    weight = Number(d.metalWeight) || 0;
    makingCharges = Number(d.makingCharges) || makingCharges;
  } else {
    purity = p.metalPurity || p.jewelleryPurity || '';
    weight = Number(p.jewelleryWeight) || Number(p.metalWeight) || 0;
  }

  return { metalType, purity, weight, makingCharges, taxRate };
}

/** Enrich order items with product data (metal, purity, weight, making charges, GST). */
export async function getEnrichedOrderForInvoice(order: any): Promise<InvoiceOrderPayload> {
  const { db } = await connectToDatabase();
  const items: InvoiceEnrichedItem[] = [];

  for (const item of order.items || []) {
    const productId = item.product?.toString?.() || item.product;
    let metalType = 'N/A';
    let purity = '-';
    let weight = 0;
    let makingCharges = 0;
    let gst = 0;
    let lineTotal = item.subtotal ?? item.price * item.quantity;

    if (productId) {
      try {
        const product = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
        const j = getProductJewelleryFields(product);
        metalType = j.metalType;
        purity = j.purity || '-';
        weight = j.weight;
        makingCharges = j.makingCharges * (item.quantity || 1);
        gst = Math.round((item.subtotal ?? 0) * j.taxRate);
        lineTotal = (item.subtotal ?? 0) + gst;
      } catch (_) {}
    }

    items.push({
      product: productId,
      productName: item.productName || 'Item',
      productImage: item.productImage || '',
      quantity: item.quantity || 1,
      price: item.price ?? 0,
      subtotal: item.subtotal ?? item.price * item.quantity,
      metalType,
      purity,
      weight: weight || undefined,
      makingCharges: makingCharges || undefined,
      gst: gst || undefined,
      lineTotal,
    });
  }

  return {
    _id: order._id?.toString?.(),
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderType: order.orderType,
    items,
    subtotal: order.subtotal ?? 0,
    shippingCharges: order.shippingCharges ?? 0,
    tax: order.tax ?? 0,
    discountAmount: order.discountAmount ?? 0,
    total: order.total ?? 0,
    paymentMethod: order.paymentMethod || 'N/A',
    paymentStatus: order.paymentStatus || 'pending',
    orderStatus: order.orderStatus || 'pending',
    shippingAddress: order.shippingAddress || {},
    billingAddress: order.billingAddress,
    createdAt: order.createdAt,
  };
}

/** Invoice number derived from order (e.g. INV-ORD000001). */
export function getInvoiceNumber(orderId: string): string {
  return `${INVOICE_NUMBER_PREFIX}-${orderId}`;
}

/** Generate role-based invoice HTML (A4-friendly). Customer: MRP + GST. Retailer: wholesale, bulk discount, no MRP. */
export function generateInvoiceHTML(
  order: InvoiceOrderPayload,
  company: InvoiceCompanyInfo,
  viewType: InvoiceViewType
): string {
  const invoiceNumber = getInvoiceNumber(order.orderId);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isRetailer = viewType === 'retailer';
  const discount = order.discountAmount ?? 0;
  const subtotal = order.subtotal ?? 0;
  const tax = order.tax ?? 0;
  const shipping = order.shippingCharges ?? 0;
  const grandTotal = order.total ?? 0;

  const tableHeadersCustomer = `
    <th>Product</th>
    <th>Metal</th>
    <th>Purity</th>
    <th>Wt (g)</th>
    <th class="text-center">Qty</th>
    <th class="text-right">Price (MRP)</th>
    <th class="text-right">Making</th>
    <th class="text-right">GST</th>
    <th class="text-right">Total</th>
  `;
  const tableHeadersRetailer = `
    <th>Product</th>
    <th>Metal</th>
    <th>Purity</th>
    <th>Wt (g)</th>
    <th class="text-center">Qty</th>
    <th class="text-right">Unit Price</th>
    <th class="text-right">Making</th>
    <th class="text-right">GST</th>
    <th class="text-right">Total</th>
  `;

  const rows = order.items
    .map(
      (item: InvoiceEnrichedItem) => `
    <tr>
      <td><strong>${item.productName}</strong></td>
      <td>${item.metalType ?? '-'}</td>
      <td>${item.purity ?? '-'}</td>
      <td class="text-right">${item.weight != null ? item.weight : '-'}</td>
      <td class="text-center">${item.quantity}</td>
      <td class="text-right">₹${(item.price ?? 0).toLocaleString('en-IN')}</td>
      <td class="text-right">${item.makingCharges != null ? `₹${item.makingCharges.toLocaleString('en-IN')}` : '-'}</td>
      <td class="text-right">${item.gst != null ? `₹${item.gst.toLocaleString('en-IN')}` : '-'}</td>
      <td class="text-right">₹${(item.lineTotal ?? item.subtotal ?? 0).toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; color: #333; font-size: 12px; padding: 20px; }
    .invoice-container { max-width: 210mm; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1F3B29 0%, #2d4a3a 100%); color: #fff; padding: 24px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 6px; }
    .header .inv-no { font-size: 14px; opacity: 0.95; }
    .two-cols { display: flex; justify-content: space-between; margin: 20px 0; gap: 24px; }
    .info-section { flex: 1; }
    .info-section h3 { color: #1F3B29; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #C8A15B; padding-bottom: 4px; }
    .info-section p { margin: 3px 0; font-size: 11px; color: #444; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #1F3B29; color: #fff; padding: 8px 6px; text-align: left; font-size: 10px; font-weight: 600; }
    td { padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 11px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary { margin-top: 16px; padding: 16px; background: #f9f9f9; border: 1px solid #eee; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .summary-row.grand { font-size: 16px; font-weight: bold; color: #1F3B29; border-top: 2px solid #1F3B29; margin-top: 8px; padding-top: 12px; }
    .footer { margin-top: 24px; padding: 16px; text-align: center; background: #1F3B29; color: #fff; font-size: 11px; }
    .meta { margin-bottom: 12px; font-size: 11px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .badge-paid { background: #d4edda; color: #155724; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-failed { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>TAX INVOICE</h1>
      <p class="inv-no">${invoiceNumber} &nbsp;|&nbsp; Order #${order.orderId}</p>
    </div>

    <div class="two-cols">
      <div class="info-section">
        <h3>From</h3>
        <p><strong>${company.name}</strong></p>
        ${company.address1 ? `<p>${company.address1}</p>` : ''}
        ${company.city ? `<p>${company.city}, ${company.state} ${company.pinCode}</p>` : ''}
        ${company.phone ? `<p>Phone: ${company.phone}</p>` : ''}
        ${company.gstNumber ? `<p>GSTIN: ${company.gstNumber}</p>` : ''}
      </div>
      <div class="info-section">
        <h3>${isRetailer ? 'Bill To (Retailer)' : 'Bill To'}</h3>
        <p><strong>${order.customerName}</strong></p>
        <p>${order.customerEmail}</p>
        ${order.shippingAddress?.addressLine1 ? `<p>${order.shippingAddress.addressLine1}</p>` : ''}
        ${order.shippingAddress?.city ? `<p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>` : ''}
        ${order.shippingAddress?.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
      </div>
    </div>

    <div class="meta">
      <strong>Order Date:</strong> ${orderDate} &nbsp;|&nbsp;
      <strong>Payment:</strong> ${String(order.paymentMethod || '').toUpperCase()} &nbsp;|&nbsp;
      <span class="badge badge-${order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus === 'failed' ? 'failed' : 'pending'}">${order.paymentStatus?.toUpperCase() ?? 'PENDING'}</span>
    </div>

    <table>
      <thead><tr>${isRetailer ? tableHeadersRetailer : tableHeadersCustomer}</tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="summary">
      <div class="summary-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
      ${discount > 0 ? `<div class="summary-row"><span>Discount</span><span>- ₹${discount.toLocaleString('en-IN')}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>₹${shipping.toLocaleString('en-IN')}</span></div>
      <div class="summary-row"><span>Tax (GST)</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
      <div class="summary-row grand"><span>Grand Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
    </div>

    <div class="footer">
      <p><strong>Payment Status:</strong> ${order.paymentStatus?.toUpperCase() ?? 'PENDING'}</p>
      <p><strong>Terms:</strong> ${order.paymentMethod === 'cod' ? 'Payment due on delivery.' : 'Payment received as per order.'} This is a computer-generated invoice.</p>
      <p style="margin-top:8px;">Thank you for your business.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/** Generate A4 PDF buffer from HTML using Puppeteer. */
export async function generateInvoicePDF(
  order: InvoiceOrderPayload,
  company: InvoiceCompanyInfo,
  viewType: InvoiceViewType
): Promise<Buffer> {
  const html = generateInvoiceHTML(order, company, viewType);
  const browser = await launchInvoiceBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = (await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    })) as Buffer;
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/** Legacy: generate PNG image (for backward compatibility). */
export async function generateInvoiceImage(order: any): Promise<{ imageBuffer: Buffer; vendor: InvoiceCompanyInfo }> {
  const company = await getInvoiceCompanyInfo(order);
  const enriched = await getEnrichedOrderForInvoice(order);
  const viewType = order.orderType === 'b2b' ? 'retailer' : 'customer';
  const html = generateInvoiceHTML(enriched, company, viewType);
  const browser = await launchInvoiceBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.setViewport({ width: 800, height: 1200 });
    const imageBuffer = (await page.screenshot({ type: 'png', fullPage: true })) as Buffer;
    return { imageBuffer, vendor: company };
  } finally {
    await browser.close();
  }
}

/** Generate A4 PDF for invoice (role-based). Returns PDF buffer and company info. */
export async function generateInvoicePDFForOrder(
  order: any,
  viewType: InvoiceViewType
): Promise<{ pdfBuffer: Buffer; company: InvoiceCompanyInfo }> {
  const company = await getInvoiceCompanyInfo(order);
  const enriched = await getEnrichedOrderForInvoice(order);
  const resolvedView = viewType === 'retailer' || order.orderType === 'b2b' ? 'retailer' : 'customer';
  const pdfBuffer = await generateInvoicePDF(enriched, company, resolvedView);
  return { pdfBuffer, company };
}

async function sendInvoiceEmail(order: any, company: InvoiceCompanyInfo, pdfBuffer: Buffer): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'parthlota113@gmail.com',
        pass: process.env.EMAIL_PASS || 'myutgfmuhrgphfkv',
      },
    });

    const invoiceNumber = getInvoiceNumber(order.orderId);
    const filename = `invoice-${order.orderId}-${company.name.replace(/\s+/g, '-')}.pdf`;

    await transporter.sendMail({
      from: `"${company.name}" <${process.env.EMAIL_USER || 'noreply@luxeloom.com'}>`,
      to: order.customerEmail,
      subject: `Invoice ${invoiceNumber} - Order #${order.orderId} - ${company.name}`,
      html: `
        <p>Dear ${order.customerName},</p>
        <p>Please find your invoice attached for Order #${order.orderId}.</p>
        <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
        <p><strong>Total:</strong> ₹${order.total?.toLocaleString('en-IN') ?? '0'}</p>
        <p>Thank you for your business.</p>
      `,
      attachments: [{ filename, content: pdfBuffer }],
    });
    console.log('[Invoice] Invoice email sent to:', order.customerEmail);
    return true;
  } catch (error) {
    console.error('[Invoice] Failed to send invoice email:', error);
    return false;
  }
}

/** Generate PDF and send invoice email. Use after order placement or on delivery. */
export async function generateAndSendInvoice(orderId: string, order: any, customerData?: { email?: string }): Promise<boolean> {
  try {
    const viewType = order.orderType === 'b2b' ? 'retailer' : 'customer';
    const { pdfBuffer, company } = await generateInvoicePDFForOrder(order, viewType);
    const toEmail = customerData?.email || order.customerEmail;
    if (toEmail) {
      await sendInvoiceEmail({ ...order, customerEmail: toEmail }, company, pdfBuffer);
    }
    return true;
  } catch (error) {
    console.error('[Invoice] Failed to generate and send invoice:', error);
    throw error;
  }
}
