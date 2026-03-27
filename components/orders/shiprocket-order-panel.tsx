'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Truck, ExternalLink } from 'lucide-react';
import { formatIndianDate } from '@/app/utils/helper';

export type ShiprocketOrderPanelProps = {
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  shiprocketCurrentStatus?: string;
  courierName?: string;
  trackingNumber?: string;
  pickupScheduledDate?: string | Date;
  pickupScheduledTime?: string;
  estimatedDelivery?: string | Date;
  trackingEvents?: Array<{
    status: string;
    location?: string;
    timestamp?: string | Date;
    description?: string;
  }>;
  /** Tighter layout for dialogs */
  compact?: boolean;
};

function fmtWhen(d: string | Date | undefined) {
  if (d == null || d === '') return '—';
  const s = typeof d === 'string' ? d : (d as Date).toISOString?.() ?? '';
  if (!s) return '—';
  return formatIndianDate(s);
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 sm:items-start py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 shrink-0 sm:w-44 text-xs sm:text-sm">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm break-all">{value ?? '—'}</span>
    </div>
  );
}

export function ShiprocketOrderPanel(props: ShiprocketOrderPanelProps) {
  const {
    shiprocketOrderId,
    shiprocketShipmentId,
    shiprocketCurrentStatus,
    courierName,
    trackingNumber,
    pickupScheduledDate,
    pickupScheduledTime,
    estimatedDelivery,
    trackingEvents,
    compact,
  } = props;

  const hasAny =
    shiprocketOrderId != null ||
    shiprocketShipmentId != null ||
    (shiprocketCurrentStatus && String(shiprocketCurrentStatus).trim() !== '') ||
    (courierName && String(courierName).trim() !== '') ||
    (trackingNumber && String(trackingNumber).trim() !== '') ||
    pickupScheduledDate != null ||
    estimatedDelivery != null ||
    (trackingEvents && trackingEvents.length > 0);

  const titleClass = compact ? 'text-base font-semibold' : 'text-xl font-bold';
  const cardClass = compact ? 'p-4' : 'p-6';

  return (
    <Card className={`${cardClass} border-violet-200/80 dark:border-violet-900/50 bg-violet-50/40 dark:bg-violet-950/20`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Truck className={`text-violet-700 dark:text-violet-400 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
          <h3 className={`${titleClass} text-slate-900 dark:text-slate-100`}>Shiprocket</h3>
        </div>
        <a
          href="https://app.shiprocket.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-violet-700 dark:text-violet-400 hover:underline shrink-0"
        >
          Open Shiprocket <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {!hasAny ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No Shiprocket shipment yet. When you set status to <strong>Shipped</strong> and choose a pickup location, order
          / AWB details will appear here. Webhook updates also sync shipment status.
        </p>
      ) : (
        <div className="space-y-1">
          <Row label="Shiprocket order ID" value={shiprocketOrderId != null ? String(shiprocketOrderId) : '—'} />
          <Row label="Shipment ID" value={shiprocketShipmentId != null ? String(shiprocketShipmentId) : '—'} />
          <Row label="Shipment status" value={shiprocketCurrentStatus || '—'} />
          <Row label="Courier" value={courierName || '—'} />
          <Row label="AWB / Tracking" value={trackingNumber || '—'} />
          <Row label="Pickup date" value={fmtWhen(pickupScheduledDate)} />
          <Row label="Pickup time" value={pickupScheduledTime || '—'} />
          <Row label="Est. delivery" value={fmtWhen(estimatedDelivery)} />
        </div>
      )}

      {trackingEvents && trackingEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-violet-200/80 dark:border-violet-900/50">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Tracking timeline</p>
          <ul className="space-y-2 max-h-48 overflow-y-auto text-xs">
            {[...trackingEvents]
              .sort((a, b) => {
                const ta = new Date(a.timestamp || 0).getTime();
                const tb = new Date(b.timestamp || 0).getTime();
                return tb - ta;
              })
              .slice(0, 20)
              .map((ev, i) => (
                <li key={i} className="pl-3 border-l-2 border-violet-300 dark:border-violet-700">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{ev.status}</span>
                  {ev.location && <span className="text-slate-600 dark:text-slate-400"> · {ev.location}</span>}
                  <div className="text-slate-500 dark:text-slate-500">{fmtWhen(ev.timestamp)}</div>
                  {ev.description && <div className="text-slate-600 dark:text-slate-400 mt-0.5">{ev.description}</div>}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
