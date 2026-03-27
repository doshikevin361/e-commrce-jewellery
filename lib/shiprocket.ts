/**
 * Shiprocket API integration for auth, serviceability, shipping and tracking.
 */

const SR = '[Shiprocket]';

function srLog(...args: unknown[]) {
  console.log(SR, ...args);
}

function srWarn(...args: unknown[]) {
  console.warn(SR, ...args);
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

function getBaseUrl(): string {
  return (process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external').trim();
}

/** 6-digit PIN for Shiprocket payloads (strips non-digits). */
export function normalizeIndianPincode(raw: string | undefined): string {
  if (!raw) return '';
  const d = String(raw).replace(/\D/g, '').slice(0, 6);
  return d;
}

function formatPhoneForShiprocket(phone: string): string {
  if (!phone) throw new Error('Phone number is required');
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.substring(2);
  if (cleaned.length !== 10) throw new Error('Phone number must be exactly 10 digits');
  if (!['9', '8', '7', '6'].includes(cleaned[0])) throw new Error('Phone number must start with 9, 8, 7, or 6');
  return cleaned;
}

/** Shiprocket is on by default; set SHIPROCKET_ENABLED=false (or 0/off/no) to turn off. */
export function isShiprocketEnabled(): boolean {
  const v = (process.env.SHIPROCKET_ENABLED || '').trim().toLowerCase();
  if (v === 'false' || v === '0' || v === 'off' || v === 'no') {
    return false;
  }
  return true;
}

export async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) {
    srLog('auth: using cached token');
    return cachedToken;
  }

  srLog('auth: requesting new token', { baseUrl: getBaseUrl(), emailSet: !!(process.env.SHIPROCKET_EMAIL || '').trim() });

  const email = (process.env.SHIPROCKET_EMAIL || '').trim();
  const apiKey = (process.env.SHIPROCKET_API_KEY || '').trim();

  if (!email || !apiKey) {
    srWarn('auth: missing SHIPROCKET_EMAIL or SHIPROCKET_API_KEY');
    throw new Error('Shiprocket email/API key is missing');
  }

  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password: apiKey }),
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid Shiprocket auth response: ${text}`);
  }

  if (!response.ok || !data?.token) {
    cachedToken = null;
    tokenExpiry = 0;
    srWarn('auth: failed', { httpStatus: response.status, message: data?.message });
    throw new Error(data?.message || 'Shiprocket authentication failed');
  }

  const token = data.token as string;
  cachedToken = token;
  tokenExpiry = now + 24 * 60 * 60 * 1000 - 5 * 60 * 1000;
  srLog('auth: success', { httpStatus: response.status });
  return token;
}

export async function checkShiprocketServiceability(
  deliveryPincode: string,
  pickupPincode?: string,
  weight = 0.5,
  codAmount?: number
): Promise<{
  isServiceable: boolean;
  couriers: Array<{
    courierId: number;
    courierName: string;
    estimatedDays: number;
    rate: number;
    codAvailable: boolean;
  }>;
}> {
  if (!isShiprocketEnabled()) {
    srLog('serviceability: skipped (Shiprocket disabled via SHIPROCKET_ENABLED)');
    return { isServiceable: false, couriers: [] };
  }

  const cleanDelivery = deliveryPincode.replace(/\s/g, '').trim();
  const cleanPickup = (pickupPincode || process.env.SHIPROCKET_PICKUP_PINCODE || '110001').replace(/\s/g, '').trim();
  if (!/^\d{6}$/.test(cleanDelivery)) throw new Error('Invalid pincode format');

  srLog('serviceability: check', {
    deliveryPincode: cleanDelivery,
    pickupPincode: cleanPickup,
    weight,
    cod: !!(codAmount && codAmount > 0),
  });

  const token = await getShiprocketToken();
  const params = new URLSearchParams({
    pickup_postcode: cleanPickup,
    delivery_postcode: cleanDelivery,
    weight: String(weight),
    cod: codAmount && codAmount > 0 ? '1' : '0',
  });

  const response = await fetch(`${getBaseUrl()}/courier/serviceability/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    srWarn('serviceability: invalid JSON response', { httpStatus: response.status });
    return { isServiceable: false, couriers: [] };
  }

  const companies = data?.data?.available_courier_companies || [];
  const couriers = (Array.isArray(companies) ? companies : []).map((c: any) => ({
    courierId: c.courier_company_id,
    courierName: c.courier_name,
    estimatedDays: Number(c.estimated_delivery_days) || 0,
    rate: c.rate || c.freight_charge || 0,
    codAvailable: c.cod === 1 || c.cod_available === true,
  }));

  const out = {
    isServiceable: response.ok && couriers.length > 0,
    couriers,
  };
  srLog('serviceability: result', {
    httpStatus: response.status,
    isServiceable: out.isServiceable,
    courierCount: couriers.length,
  });
  return out;
}

/** Shiprocket “pickup location” nickname + address (POST settings/company/addpickup). */
export type ShiprocketAddPickupInput = {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country?: string;
  pin_code: string;
};

export async function shiprocketListPickupLocationsFromApi(): Promise<{
  success: boolean;
  locations?: unknown;
  error?: string;
}> {
  if (!isShiprocketEnabled()) {
    return { success: false, error: 'Shiprocket is disabled' };
  }
  try {
    const token = await getShiprocketToken();
    const response = await fetch(`${getBaseUrl()}/settings/company/pickup`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return { success: false, error: 'Invalid JSON from Shiprocket' };
    }
    if (!response.ok) {
      srWarn('listPickupLocations: API error', { httpStatus: response.status, message: data?.message });
      return { success: false, error: data?.message || `HTTP ${response.status}` };
    }
    return { success: true, locations: data?.data ?? data };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Shiprocket list pickup failed' };
  }
}

export async function shiprocketAddPickupLocationViaApi(
  input: ShiprocketAddPickupInput
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!isShiprocketEnabled()) {
    return { success: false, error: 'Shiprocket is disabled' };
  }
  try {
    const token = await getShiprocketToken();
    const phone = formatPhoneForShiprocket(input.phone);
    const body = {
      pickup_location: input.pickup_location.trim(),
      name: input.name.trim(),
      email: input.email.trim(),
      phone,
      address: input.address.trim(),
      address_2: (input.address_2 || '').trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      country: (input.country || 'India').trim(),
      pin_code: String(input.pin_code).replace(/\s/g, '').trim(),
    };
    srLog('addPickupLocation: request', { pickup_location: body.pickup_location });
    const response = await fetch(`${getBaseUrl()}/settings/company/addpickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return { success: false, error: text?.slice(0, 200) || 'Invalid Shiprocket response' };
    }
    if (!response.ok) {
      srWarn('addPickupLocation: API error', { httpStatus: response.status, message: data?.message });
      return { success: false, error: data?.message || `HTTP ${response.status}` };
    }
    srLog('addPickupLocation: success', { pickup_location: body.pickup_location });
    return { success: true, data: data?.data ?? data };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Shiprocket add pickup failed' };
  }
}

export async function createShiprocketOrder(orderData: {
  orderId: string;
  orderDate: Date;
  /** Used in Shiprocket order + emails in payload */
  customerEmail?: string;
  /** Warehouse nickname — must exist on Shiprocket account */
  pickupLocation?: string;
  items: Array<{ productName: string; sku?: string; quantity: number; price: number; hsn?: string }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  subtotal: number;
  total: number;
  paymentMethod: 'cod' | 'razorpay';
}): Promise<{ success: boolean; shiprocketOrderId?: number; shipmentId?: number; awbCode?: string; error?: string }> {
  if (!isShiprocketEnabled()) {
    srLog('createOrder: skipped (disabled)', { orderId: orderData.orderId });
    return { success: false, error: 'Shiprocket is disabled' };
  }

  try {
    srLog('createOrder: start', {
      orderId: orderData.orderId,
      paymentMethod: orderData.paymentMethod,
      itemCount: orderData.items?.length ?? 0,
      total: orderData.total,
      shippingPincode: orderData.shippingAddress?.postalCode,
    });
    const token = await getShiprocketToken();
    const billing = orderData.billingAddress || orderData.shippingAddress;
    const shipping = orderData.shippingAddress;
    const shippingName = shipping.fullName.trim().split(/\s+/);
    const billingName = billing.fullName.trim().split(/\s+/);
    const billingFirst = billingName[0] || billing.fullName.trim() || 'Customer';
    const billingLast = billingName.slice(1).join(' ').trim() || billingFirst;
    const shipFirst = shippingName[0] || shipping.fullName.trim() || 'Customer';
    const shipLast = shippingName.slice(1).join(' ').trim() || shipFirst;
    const sameAddr =
      !orderData.billingAddress ||
      ((billing.addressLine1 || '').trim() === (shipping.addressLine1 || '').trim() &&
        billing.postalCode.replace(/\s/g, '') === shipping.postalCode.replace(/\s/g, ''));
    const orderEmail =
      (orderData.customerEmail || '').trim() ||
      (process.env.SHIPROCKET_ORDER_FALLBACK_EMAIL || '').trim() ||
      'noreply@example.com';
    const pickupLoc =
      (orderData.pickupLocation || '').trim() ||
      (process.env.SHIPROCKET_PICKUP_LOCATION || '').trim() ||
      undefined;

    const payload: any = {
      order_id: orderData.orderId,
      order_date: new Date(orderData.orderDate).toISOString().replace('T', ' ').substring(0, 16),
      billing_customer_name: billingFirst,
      billing_last_name: billingLast,
      billing_address: billing.addressLine1,
      billing_address_2: billing.addressLine2 || '',
      billing_city: billing.city,
      billing_pincode: normalizeIndianPincode(billing.postalCode) || billing.postalCode.replace(/\s/g, '').trim(),
      billing_state: billing.state,
      billing_country: billing.country || 'India',
      billing_email: orderEmail,
      billing_phone: formatPhoneForShiprocket(billing.phone),
      shipping_is_billing: sameAddr,
      shipping_customer_name: shipFirst,
      shipping_last_name: shipLast,
      shipping_address: shipping.addressLine1,
      shipping_address_2: shipping.addressLine2 || '',
      shipping_city: shipping.city,
      shipping_pincode: normalizeIndianPincode(shipping.postalCode) || shipping.postalCode.replace(/\s/g, '').trim(),
      shipping_state: shipping.state,
      shipping_country: shipping.country || 'India',
      shipping_email: orderEmail,
      shipping_phone: formatPhoneForShiprocket(shipping.phone),
      order_items: orderData.items.map((i) => ({
        name: i.productName,
        sku: i.sku || `SKU-${orderData.orderId}`,
        units: i.quantity,
        selling_price: i.price,
        tax: 0,
        hsn: i.hsn || '62046990',
      })),
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: orderData.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: Math.max(0.5, orderData.items.reduce((sum, i) => sum + i.quantity * 0.5, 0)),
      pickup_location: pickupLoc,
    };

    if (orderData.paymentMethod === 'cod') payload.cod_amount = orderData.total;

    const response = await fetch(`${getBaseUrl()}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const d = data?.data || data;
    if (!response.ok || (!d?.shipment_id && !d?.order_id)) {
      srWarn('createOrder: API error', {
        orderId: orderData.orderId,
        httpStatus: response.status,
        message: data?.message,
      });
      return { success: false, error: data?.message || 'Shiprocket order creation failed' };
    }

    srLog('createOrder: success', {
      orderId: orderData.orderId,
      shiprocketOrderId: d.order_id,
      shipmentId: d.shipment_id,
      hasAwb: !!d.awb_code,
    });
    return {
      success: true,
      shiprocketOrderId: d.order_id,
      shipmentId: d.shipment_id,
      awbCode: d.awb_code,
    };
  } catch (error: any) {
    srWarn('createOrder: exception', { orderId: orderData.orderId, message: error?.message });
    return { success: false, error: error?.message || 'Shiprocket order creation failed' };
  }
}

export async function generateShiprocketAWB(shipmentId: number, courierId?: number): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  orderId?: number;
  error?: string;
}> {
  if (!isShiprocketEnabled()) return { success: false, error: 'Shiprocket is disabled' };
  try {
    srLog('assignAWB: start', { shipmentId, courierId: courierId ?? 'default' });
    const token = await getShiprocketToken();
    const body: any = { shipment_id: shipmentId };
    if (courierId) body.courier_id = courierId;

    const response = await fetch(`${getBaseUrl()}/courier/assign/awb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const awbData = data?.data?.awb_code
      ? data.data
      : data?.response?.data?.awb_code
        ? data.response.data
        : data;

    if (!response.ok || !awbData?.awb_code || awbData?.awb_assign_error) {
      srWarn('assignAWB: failed', {
        shipmentId,
        httpStatus: response.status,
        message: data?.message || awbData?.awb_assign_error,
      });
      return { success: false, error: data?.message || awbData?.awb_assign_error || 'AWB generation failed' };
    }

    srLog('assignAWB: success', {
      shipmentId,
      awbPrefix: awbData.awb_code ? String(awbData.awb_code).slice(0, 6) + '…' : undefined,
      courierName: awbData.courier_name,
    });
    return {
      success: true,
      awbCode: awbData.awb_code,
      courierName: awbData.courier_name,
      orderId: awbData.order_id,
    };
  } catch (error: any) {
    srWarn('assignAWB: exception', { shipmentId, message: error?.message });
    return { success: false, error: error?.message || 'AWB generation failed' };
  }
}

export async function requestShiprocketPickup(shipmentId: number): Promise<{
  success: boolean;
  pickupScheduledDate?: Date;
  pickupScheduledTime?: string;
  error?: string;
}> {
  if (!isShiprocketEnabled()) return { success: false, error: 'Shiprocket is disabled' };
  try {
    srLog('pickup: request', { shipmentId });
    const token = await getShiprocketToken();
    const response = await fetch(`${getBaseUrl()}/courier/generate/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipment_id: [shipmentId] }),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const msg = typeof data?.message === 'string' ? data.message : '';
    if (!response.ok) {
      // Shiprocket often queues pickup automatically after AWB — second request returns this.
      if (/already in pickup queue/i.test(msg)) {
        srLog('pickup: already queued (ok)', { shipmentId });
        return { success: true };
      }
      srWarn('pickup: failed', { shipmentId, httpStatus: response.status, message: data?.message });
      return { success: false, error: data?.message || 'Pickup request failed' };
    }

    const d = data?.data || data;
    srLog('pickup: success', { shipmentId, pickup_date: d.pickup_date });
    return {
      success: true,
      pickupScheduledDate: d.pickup_date ? new Date(d.pickup_date) : undefined,
      pickupScheduledTime: d.pickup_time || d.scheduled_time || '10:00 AM - 6:00 PM',
    };
  } catch (error: any) {
    srWarn('pickup: exception', { shipmentId, message: error?.message });
    return { success: false, error: error?.message || 'Pickup request failed' };
  }
}

export async function cancelShiprocketOrder(
  shipmentId: number,
  orderNumber?: string,
  shiprocketOrderId?: number
): Promise<{ success: boolean; error?: string }> {
  if (!isShiprocketEnabled()) return { success: false, error: 'Shiprocket is disabled' };
  try {
    const cancelId = shiprocketOrderId || orderNumber || shipmentId;
    srLog('cancel: request', { shipmentId, cancelId, hasShiprocketOrderId: !!shiprocketOrderId });
    const token = await getShiprocketToken();

    const response = await fetch(`${getBaseUrl()}/orders/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: [cancelId] }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      srWarn('cancel: failed', { shipmentId, httpStatus: response.status, message: data?.message });
      return { success: false, error: data?.message || 'Cancel failed' };
    }
    srLog('cancel: success', { shipmentId });
    return { success: true };
  } catch (error: any) {
    srWarn('cancel: exception', { shipmentId, message: error?.message });
    return { success: false, error: error?.message || 'Cancel failed' };
  }
}

export async function trackShiprocketShipment(shipmentId: number): Promise<{
  success: boolean;
  currentStatus?: string;
  events?: Array<{ status: string; location?: string; timestamp: Date; description?: string }>;
  error?: string;
}> {
  if (!isShiprocketEnabled()) return { success: false, error: 'Shiprocket is disabled' };
  try {
    srLog('track: request', { shipmentId });
    const token = await getShiprocketToken();
    const response = await fetch(`${getBaseUrl()}/courier/track/shipment/${shipmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      srWarn('track: failed', { shipmentId, httpStatus: response.status, message: data?.message });
      return { success: false, error: data?.message || 'Tracking failed' };
    }

    const d = data?.data || data;
    const history = d?.tracking_data?.track_history || d?.track_history || d?.tracking_data || [];
    const events = (Array.isArray(history) ? history : []).map((e: any) => ({
      status: e.status || e.current_status || '',
      location: e.location || e.city || '',
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      description: e.message || e.status || '',
    }));
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const currentStatus = d?.current_status || d?.status || events[0]?.status || '';
    srLog('track: success', { shipmentId, currentStatus, eventCount: events.length });
    return {
      success: true,
      currentStatus,
      events,
    };
  } catch (error: any) {
    srWarn('track: exception', { shipmentId, message: error?.message });
    return { success: false, error: error?.message || 'Tracking failed' };
  }
}

export function mapShiprocketStatusToOrderStatus(status: string): string {
  const s = (status || '').toUpperCase();
  if (['NEW', 'PICKUP_PENDING', 'PICKUP_COMPLETE'].includes(s)) return 'processing';
  if (['PICKED_UP', 'IN_TRANSIT', 'INPROCESS'].includes(s)) return 'shipped';
  if (['OUT_FOR_DELIVERY', 'OUT FOR DELIVERY'].includes(s)) return 'shipped';
  if (s === 'DELIVERED') return 'delivered';
  if (['CANCELLED', 'CANCELED'].includes(s)) return 'cancelled';
  return 'processing';
}
