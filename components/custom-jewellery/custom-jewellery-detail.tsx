'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import Image from 'next/image';
import { formatIndianDate } from '@/app/utils/helper';

interface CustomJewelleryRequest {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  jewelleryType: string;
  metalType: string;
  budgetRange: string;
  description: string;
  images: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomJewelleryDetailProps {
  request: CustomJewelleryRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function CustomJewelleryDetail({ request, open, onOpenChange, onUpdate }: CustomJewelleryDetailProps) {
  const [status, setStatus] = useState(request.status);
  const [internalNotes, setInternalNotes] = useState(request.internalNotes || '');
  const [saving, setSaving] = useState(false);

  // Update state when request prop changes
  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setInternalNotes(request.internalNotes || '');
    }
  }, [request]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      reviewed: { variant: 'secondary', label: 'Reviewed' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/custom-jewellery/${request._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          internalNotes,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Request updated successfully', variant: 'default' });
        onUpdate();
        onOpenChange(false);
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error || 'Failed to update request', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-4'>
            <span>Custom Jewellery Request Details</span>
            {getStatusBadge(status)}
          </DialogTitle>
          <DialogDescription>View and manage custom jewellery request</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          {/* Customer Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Full Name</Label>
              <p className='mt-1 text-sm'>{request.fullName}</p>
            </div>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Email</Label>
              <p className='mt-1 text-sm'>{request.email}</p>
            </div>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Phone</Label>
              <p className='mt-1 text-sm'>{request.phone}</p>
            </div>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Submitted Date</Label>
              <p className='mt-1 text-sm'>{request.createdAt ? formatIndianDate(request.createdAt) : '-'}</p>
            </div>
          </div>

          {/* Jewellery Details */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Jewellery Type</Label>
              <p className='mt-1 text-sm'>{request.jewelleryType}</p>
            </div>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Metal Type</Label>
              <p className='mt-1 text-sm'>{request.metalType}</p>
            </div>
            <div>
              <Label className='text-sm font-semibold text-gray-500'>Budget Range</Label>
              <p className='mt-1 text-sm'>{request.budgetRange}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className='text-sm font-semibold text-gray-500'>Description / Requirements</Label>
            <p className='mt-1 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md'>{request.description}</p>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <Label className='text-sm font-semibold text-gray-500 mb-2 block'>Uploaded Images</Label>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                {request.images.map((image, index) => (
                  <div key={index} className='relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200'>
                    <Image
                      src={image}
                      alt={`Reference image ${index + 1}`}
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Controls */}
          <div className='border-t pt-4 space-y-4'>
            <div>
              <Label htmlFor='status' className='text-sm font-semibold'>
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id='status' className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='reviewed'>Reviewed</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='internalNotes' className='text-sm font-semibold'>
                Internal Notes
              </Label>
              <Textarea
                id='internalNotes'
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder='Add internal notes about this request...'
                className='mt-1'
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end gap-2 pt-4 border-t'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              <X className='w-4 h-4 mr-2' />
              Close
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className='w-4 h-4 mr-2' />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
