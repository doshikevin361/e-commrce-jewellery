/** Minimal OTP email body for vendor/customer signup — avoids pulling full email-templates. */
export function generateOTPEmailHTML(data: {
  customerName: string;
  otp: string;
  purpose: 'login' | 'signup';
  expiryMinutes?: number;
}): string {
  const site = process.env.NEXT_PUBLIC_SITE_NAME || 'Jewellery Store';
  const mins = data.expiryMinutes ?? 10;
  const title = data.purpose === 'login' ? 'Login verification' : 'Signup verification';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p>Hi ${escapeHtml(data.customerName || 'there')},</p>
<p>${title} — use this one-time password:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:4px">${escapeHtml(data.otp)}</p>
<p>Valid for ${mins} minutes. If you did not request this, ignore this email.</p>
<p style="color:#666;font-size:13px">${escapeHtml(site)}</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
