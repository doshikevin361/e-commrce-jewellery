/**
 * Invoice types for jewellery eCommerce - role-based (customer vs retailer) and enriched line items.
 */

export type InvoiceViewType = 'customer' | 'retailer';

export interface InvoiceEnrichedItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  /** From product: metal type (Gold, Silver, Platinum, etc.) */
  metalType?: string;
  /** From product: purity e.g. 18kt, 22kt */
  purity?: string;
  /** Weight in grams */
  weight?: number;
  /** Making charges per line (₹) */
  makingCharges?: number;
  /** GST amount for this line */
  gst?: number;
  /** Line total (subtotal + gst if applicable) */
  lineTotal?: number;
}

export interface InvoiceCompanyInfo {
  name: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
}

export interface InvoicePricingSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shippingCharges: number;
  grandTotal: number;
}

export interface InvoiceOrderPayload {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderType?: 'b2b' | 'retailer';
  items: InvoiceEnrichedItem[];
  subtotal: number;
  shippingCharges: number;
  tax: number;
  discountAmount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string | Date;
}
