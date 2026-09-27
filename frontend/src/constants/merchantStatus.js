/**
 * Nearza — Merchant Verification Status Enumeration & Constants
 * Single authoritative source of truth for merchant verification states across frontend.
 */

export const MERCHANT_STATUS = Object.freeze({
  ALL: 'all',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

export const MERCHANT_STATUS_LABELS = Object.freeze({
  [MERCHANT_STATUS.ALL]: 'All',
  [MERCHANT_STATUS.PENDING]: 'Pending',
  [MERCHANT_STATUS.APPROVED]: 'Approved',
  [MERCHANT_STATUS.REJECTED]: 'Rejected',
  [MERCHANT_STATUS.SUSPENDED]: 'Suspended',
});

export const MERCHANT_STATUS_COLORS = Object.freeze({
  [MERCHANT_STATUS.ALL]: 'bg-slate-100 text-slate-700 border-slate-300',
  [MERCHANT_STATUS.PENDING]: 'bg-amber-50 text-amber-800 border-amber-300',
  [MERCHANT_STATUS.APPROVED]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  [MERCHANT_STATUS.REJECTED]: 'bg-rose-50 text-rose-800 border-rose-300',
  [MERCHANT_STATUS.SUSPENDED]: 'bg-slate-100 text-slate-700 border-slate-300',
});

/**
 * Normalizes any string representation to a canonical status.
 * Defaults to 'all' if unmatched.
 */
export function normalizeMerchantStatus(raw) {
  if (!raw) return MERCHANT_STATUS.ALL;
  const lower = String(raw).trim().toLowerCase();
  switch (lower) {
    case 'approved':
    case 'approve':
      return MERCHANT_STATUS.APPROVED;
    case 'rejected':
    case 'reject':
      return MERCHANT_STATUS.REJECTED;
    case 'suspended':
    case 'suspend':
      return MERCHANT_STATUS.SUSPENDED;
    case 'pending':
      return MERCHANT_STATUS.PENDING;
    case 'all':
    default:
      return MERCHANT_STATUS.ALL;
  }
}
