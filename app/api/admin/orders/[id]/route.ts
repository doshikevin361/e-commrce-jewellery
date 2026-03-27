import { NextRequest, NextResponse } from 'next/server';
import { connectDB, connectToDatabase } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getUserFromRequest, isAdminOrVendor, isVendor } from '@/lib/auth';
import { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';
import { ObjectId } from 'mongodb';
import {
  cancelShiprocketOrder,
  createShiprocketOrder,
  generateShiprocketAWB,
  requestShiprocketPickup,
  isShiprocketEnabled,
} from '@/lib/shiprocket';
import { findPickupLocationForOrderShip } from '@/lib/pickup-locations';

// Force nodejs runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    const deniedOr = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');
    if (deniedOr) return deniedOr;

    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // For vendors, check if this order contains their products
    if (isVendor(user)) {
      try {
        const { db } = await connectToDatabase();
        const vendorProducts = await db.collection('products')
          .find({ vendorId: user.id })
          .project({ _id: 1 })
          .toArray();
        const vendorProductIds = vendorProducts.map(p => p._id.toString());
        
        // Check if any order item belongs to vendor
        const hasVendorProduct = order.items.some(item => 
          vendorProductIds.includes(item.product.toString())
        );
        
        if (!hasVendorProduct) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        // Filter items to only show vendor's products
        order.items = order.items.filter(item => 
          vendorProductIds.includes(item.product.toString())
        );
      } catch (vendorError) {
        console.error('[Order API] Error checking vendor products:', vendorError);
        return NextResponse.json({ error: 'Failed to verify order access' }, { status: 500 });
      }
    }

    // Try to enrich with customer data from MongoDB
    let customerData = null;
    if (order.customer) {
      try {
        const { db } = await connectToDatabase();
        const customerId = typeof order.customer === 'string' 
          ? new ObjectId(order.customer) 
          : order.customer;
        const customer = await db.collection('customers').findOne({ _id: customerId });
        if (customer) {
          customerData = {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          };
        }
      } catch (err) {
        console.error('[Order API] Error fetching customer:', err);
      }
    }

    // Serialize the order
    const serializedOrder = {
      ...order,
      _id: order._id?.toString(),
      customer: customerData || (order.customer ? {
        _id: typeof order.customer === 'string' ? order.customer : order.customer.toString(),
      } : null),
    };

    return NextResponse.json({ order: serializedOrder });
  } catch (error) {
    console.error('[v0] Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    const deniedOr = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');
    if (deniedOr) return deniedOr;

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // First, check if the order exists and if vendor has access
    const existingOrder = await Order.findById(id).lean();
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // For vendors, check if this order contains their products
    if (isVendor(user)) {
      try {
        const { db } = await connectToDatabase();
        const vendorProducts = await db.collection('products')
          .find({ vendorId: user.id })
          .project({ _id: 1 })
          .toArray();
        const vendorProductIds = vendorProducts.map(p => p._id.toString());
        
        // Check if any order item belongs to vendor
        const hasVendorProduct = existingOrder.items.some(item => 
          vendorProductIds.includes(item.product.toString())
        );
        
        if (!hasVendorProduct) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
      } catch (vendorError) {
        console.error('[Order API] Error checking vendor products:', vendorError);
        return NextResponse.json({ error: 'Failed to verify order access' }, { status: 500 });
      }
    }

    const { orderStatus, orderNotes, trackingNumber, paymentStatus, pickupLocation } = body;

    /** Shiprocket adhoc order needs a saved pickup nickname (Pickup locations CRUD). */
    let shiprocketPickupNickname: string | undefined;
    if (
      orderStatus === 'shipped' &&
      !(existingOrder.shiprocketShipmentId as number | undefined) &&
      isShiprocketEnabled()
    ) {
      const raw = typeof pickupLocation === 'string' ? pickupLocation.trim() : '';
      if (!raw) {
        return NextResponse.json(
          { error: 'pickupLocation is required. Add one under Pickup locations, then select its nickname here.' },
          { status: 400 }
        );
      }
      const { db } = await connectToDatabase();
      const doc = await findPickupLocationForOrderShip(db, user!, raw);
      if (!doc) {
        return NextResponse.json(
          { error: 'Invalid pickup location. Use a nickname from Pickup locations (Admin → Pickup locations).' },
          { status: 400 }
        );
      }
      shiprocketPickupNickname = String(doc.pickupLocation);
    }

    // Validate order status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    const shiprocketWarnings: string[] = [];

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      
      // Set timestamps based on status
      if (orderStatus === 'delivered') {
        updateData.deliveredAt = new Date();
      } else if (orderStatus === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
    }

    // Shiprocket sync on lifecycle changes
    if (orderStatus && !isShiprocketEnabled() && (orderStatus === 'shipped' || orderStatus === 'cancelled')) {
      console.log('[Shiprocket][OrderAPI] status change skipped — SHIPROCKET_ENABLED=false/0/off', {
        orderId: existingOrder.orderId,
        newStatus: orderStatus,
      });
    }

    if (orderStatus && isShiprocketEnabled()) {
      try {
        const mongoOrderId = String(existingOrder._id);
        const bizOrderId = existingOrder.orderId;
        console.log('[Shiprocket][OrderAPI] sync start', {
          mongoOrderId,
          orderId: bizOrderId,
          newStatus: orderStatus,
        });

        const existingShipmentId = existingOrder.shiprocketShipmentId as number | undefined;
        const existingShiprocketOrderId = existingOrder.shiprocketOrderId as number | undefined;

        // Cancel shipment on cancellation
        if (orderStatus === 'cancelled' && existingShipmentId) {
          console.log('[Shiprocket][OrderAPI] cancelling shipment', {
            mongoOrderId,
            orderId: bizOrderId,
            shipmentId: existingShipmentId,
            shiprocketOrderId: existingShiprocketOrderId,
          });
          await cancelShiprocketOrder(
            existingShipmentId,
            existingShiprocketOrderId ? undefined : existingOrder.orderId,
            existingShiprocketOrderId
          );
        }

        // Generate shipment workflow when order moves to shipped
        if (orderStatus === 'shipped') {
          let shipmentId = existingShipmentId;
          let shiprocketOrderId = existingShiprocketOrderId;
          let awbCode = existingOrder.trackingNumber as string | undefined;
          let courierName = existingOrder.courierName as string | undefined;

          console.log('[Shiprocket][OrderAPI] shipped flow', {
            mongoOrderId,
            orderId: bizOrderId,
            hadShipmentId: !!existingShipmentId,
            hadAwb: !!existingOrder.trackingNumber,
          });

          if (!shipmentId) {
            const created = await createShiprocketOrder({
              orderId: existingOrder.orderId,
              orderDate: existingOrder.createdAt,
              customerEmail: existingOrder.customerEmail as string | undefined,
              pickupLocation: shiprocketPickupNickname,
              items: (existingOrder.items || []).map((i: any) => ({
                productName: i.productName,
                sku: i.sku,
                quantity: i.quantity,
                price: i.price,
                hsn: i.hsn,
              })),
              shippingAddress: {
                fullName: existingOrder.shippingAddress?.fullName,
                phone: existingOrder.shippingAddress?.phone,
                addressLine1: existingOrder.shippingAddress?.addressLine1,
                addressLine2: existingOrder.shippingAddress?.addressLine2,
                city: existingOrder.shippingAddress?.city,
                state: existingOrder.shippingAddress?.state,
                postalCode: existingOrder.shippingAddress?.postalCode,
                country: existingOrder.shippingAddress?.country || 'India',
              },
              billingAddress: existingOrder.billingAddress
                ? {
                    fullName: existingOrder.billingAddress.fullName,
                    phone: existingOrder.billingAddress.phone,
                    addressLine1: existingOrder.billingAddress.addressLine1,
                    addressLine2: existingOrder.billingAddress.addressLine2,
                    city: existingOrder.billingAddress.city,
                    state: existingOrder.billingAddress.state,
                    postalCode: existingOrder.billingAddress.postalCode,
                    country: existingOrder.billingAddress.country || 'India',
                  }
                : undefined,
              subtotal: existingOrder.subtotal,
              total: existingOrder.total,
              paymentMethod: existingOrder.paymentMethod,
            });

            if (created.success) {
              shipmentId = created.shipmentId;
              shiprocketOrderId = created.shiprocketOrderId;
              awbCode = awbCode || created.awbCode;
            } else {
              console.warn('[Shiprocket][OrderAPI] createOrder failed', {
                mongoOrderId,
                orderId: bizOrderId,
                error: created.error,
              });
              if (created.error) shiprocketWarnings.push(`Shiprocket create order: ${created.error}`);
            }
          }

          if (shipmentId && !awbCode) {
            console.log('[Shiprocket][OrderAPI] generating AWB', { mongoOrderId, shipmentId });
            const awb = await generateShiprocketAWB(shipmentId);
            if (awb.success) {
              awbCode = awb.awbCode;
              courierName = awb.courierName || courierName;
              shiprocketOrderId = awb.orderId || shiprocketOrderId;
            } else {
              console.warn('[Shiprocket][OrderAPI] AWB failed', {
                mongoOrderId,
                shipmentId,
                error: awb.error,
              });
              if (awb.error) shiprocketWarnings.push(`AWB: ${awb.error}`);
            }
          }

          if (shipmentId) {
            const pickup = await requestShiprocketPickup(shipmentId);
            if (pickup.success) {
              updateData.pickupScheduledDate = pickup.pickupScheduledDate;
              updateData.pickupScheduledTime = pickup.pickupScheduledTime;
            } else {
              console.warn('[Shiprocket][OrderAPI] pickup request failed', {
                mongoOrderId,
                shipmentId,
                error: pickup.error,
              });
              if (pickup.error) shiprocketWarnings.push(`Pickup: ${pickup.error}`);
            }
          }

          if (shipmentId) updateData.shiprocketShipmentId = shipmentId;
          if (shiprocketOrderId) updateData.shiprocketOrderId = shiprocketOrderId;
          if (awbCode) updateData.trackingNumber = awbCode;
          if (courierName) updateData.courierName = courierName;

          console.log('[Shiprocket][OrderAPI] shipped flow done', {
            mongoOrderId,
            orderId: bizOrderId,
            shipmentId,
            shiprocketOrderId,
            hasTracking: !!awbCode,
          });
        }
      } catch (shiprocketError) {
        console.error('[Shiprocket][OrderAPI] sync error:', shiprocketError);
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (orderNotes !== undefined) {
      updateData.orderNotes = orderNotes;
    }

    // Do not overwrite AWB from Shiprocket with an empty tracking field from the form.
    if (trackingNumber !== undefined) {
      const t = typeof trackingNumber === 'string' ? trackingNumber.trim() : String(trackingNumber ?? '').trim();
      if (t !== '') {
        updateData.trackingNumber = t;
      }
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Try to enrich with customer data from MongoDB
    let customerData = null;
    if (order.customer) {
      try {
        const { db } = await connectToDatabase();
        const customerId = typeof order.customer === 'string' 
          ? new ObjectId(order.customer) 
          : order.customer;
        const customer = await db.collection('customers').findOne({ _id: customerId });
        if (customer) {
          customerData = {
            _id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          };
        }
      } catch (err) {
        console.error('[Order API] Error fetching customer:', err);
      }
    }

    // Send email notification to customer if order status was updated
    if (orderStatus && customerData?.email) {
      try {
        // Dynamically import email functions to avoid worker issues
        const { sendEmail, emailTemplates } = await import('@/lib/email');
        
        const emailTemplate = emailTemplates.orderStatusUpdate({
          orderId: order.orderId,
          customerName: order.customerName,
          orderStatus: order.orderStatus,
          trackingNumber: order.trackingNumber,
          items: order.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
          })),
          total: order.total,
        });

        await sendEmail({
          to: customerData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
        console.log('[Order API] Order status update email sent to:', customerData.email);

        // If order is delivered, send invoice email
        if (orderStatus === 'delivered') {
          try {
            // Import invoice generation function
            const { generateAndSendInvoice } = await import('@/lib/invoice');
            const orderPlain = order.toObject ? order.toObject() : order;
            await generateAndSendInvoice(order.orderId, orderPlain, customerData);
            console.log('[Order API] Invoice email sent to:', customerData.email);
          } catch (invoiceError) {
            console.error('[Order API] Failed to send invoice email:', invoiceError);
            // Don't fail the update if invoice email fails
          }
        }
      } catch (emailError) {
        console.error('[Order API] Failed to send order status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    // Serialize the order
    let finalOrder = { ...order };
    
    // For vendors, filter items to only show their products
    if (isVendor(user)) {
      try {
        const { db } = await connectToDatabase();
        const vendorProducts = await db.collection('products')
          .find({ vendorId: user.id })
          .project({ _id: 1 })
          .toArray();
        const vendorProductIds = vendorProducts.map(p => p._id.toString());
        
        finalOrder.items = order.items.filter(item => 
          vendorProductIds.includes(item.product.toString())
        );
      } catch (vendorError) {
        console.error('[Order API] Error filtering vendor items:', vendorError);
      }
    }
    
    const serializedOrder = {
      ...finalOrder,
      _id: finalOrder._id?.toString(),
      customer: customerData || (finalOrder.customer ? {
        _id: typeof finalOrder.customer === 'string' ? finalOrder.customer : finalOrder.customer.toString(),
      } : null),
    };

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: serializedOrder,
      ...(shiprocketWarnings.length > 0 ? { shiprocketWarnings } : {}),
    });
  } catch (error: any) {
    console.error('[v0] Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

