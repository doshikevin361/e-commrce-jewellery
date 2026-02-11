'use client';

import { useState, useEffect } from 'react';
import { CommonDialog } from '../dialog/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderId: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  orderNotes?: string;
}

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderUpdated: () => void;
}

export function EditOrderModal({ open, onOpenChange, order, onOrderUpdated }: EditOrderModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderStatus: '',
    trackingNumber: '',
    orderNotes: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderStatus: order.orderStatus || '',
        trackingNumber: order.trackingNumber || '',
        orderNotes: order.orderNotes || '',
      });
    }
  }, [order]);

  const handleSubmit = async () => {
    if (!order) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Order updated successfully',
          variant: 'default',
        });
        onOrderUpdated();
        onOpenChange(false);
      } else {
        throw new Error(data.error || data.details || 'Failed to update order');
      }
    } catch (error) {
      console.error('[EditOrderModal] Error updating order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Order"
      description={order?.orderId}
      onConfirm={handleSubmit}
      confirmText="Save Changes"
      cancelText="Cancel"
      loading={loading}
    >
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="orderStatus">Order Status</Label>
          <Select
            value={formData.orderStatus}
            onValueChange={(value) => setFormData({ ...formData, orderStatus: value })}
          >
            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
              <SelectValue placeholder="Select order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
          <Input
            id="trackingNumber"
            type="text"
            placeholder="Enter tracking number"
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
          <Textarea
            id="orderNotes"
            placeholder="Add notes about this order..."
            value={formData.orderNotes}
            onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[100px]"
          />
        </div>
      </div>
    </CommonDialog>
  );
}
