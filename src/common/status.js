/**
 * =====================================================================
 *  Canonical Status Dictionary, Formatters & Domain Rules - KhetSetu
 *  Single Source of Truth across Farmer, Buyer, and Admin panels
 * =====================================================================
 */

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  ESCROW_HELD: 'escrow_held',
  ACCEPTED: 'accepted',
  PACKING: 'packing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  INSPECTION: 'inspection',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const LISTING_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  LIVE: 'live',
  PAUSED: 'paused',
  SOLD_OUT: 'sold_out',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
};

export const PAYOUT_STATUS = {
  NOT_ELIGIBLE: 'not_eligible',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  SETTLED: 'settled',
  ON_HOLD: 'on_hold',
  FAILED: 'failed',
};

/**
 * Status Metadata with translated plain-language labels per role
 */
export const STATUS_CONFIG = {
  // Order Statuses
  pending_payment: {
    color: 'warning',
    farmer: { en: 'Awaiting Payment', gu: 'ચુકવણી બાકી છે', hi: 'भुगतान प्रतीक्षारत' },
    buyer: { en: 'Awaiting Payment', gu: 'ચુકવણી બાકી છે', hi: 'भुगतान प्रतीक्षारत' },
    admin: { en: 'Payment Pending', gu: 'ચુકવણી બાકી', hi: 'भुगतान लंबित' },
  },
  escrow_held: {
    color: 'amber',
    farmer: { en: 'New Order — Please Accept', gu: 'નવો ઓર્ડર — સ્વીકારો', hi: 'नया ऑर्डर — स्वीकार करें' },
    buyer: { en: 'Payment Secured in Escrow', gu: 'એસ્ક્રોમાં ચુકવણી સુરક્ષિત', hi: 'एस्क्रो में भुगतान सुरक्षित' },
    admin: { en: 'Escrow Held', gu: 'એસ્ક્રો લોક', hi: 'एस्क्रो सुरक्षित' },
  },
  accepted: {
    color: 'info',
    farmer: { en: 'Accepted — Prepare Dispatch', gu: 'સ્વીકાર્યો — મોકલવાની તૈયારી કરો', hi: 'स्वीकृत — भेजने की तैयारी करें' },
    buyer: { en: 'Seller Confirmed', gu: 'વેચનાર દ્વારા પુષ્ટિ થયેલ', hi: 'विक्रेता द्वारा पुष्टि' },
    admin: { en: 'Seller Confirmed', gu: 'પુષ્ટિ થયેલ', hi: 'पुष्टि की गई' },
  },
  packing: {
    color: 'purple',
    farmer: { en: 'Packing Harvest', gu: 'પેકિંગ થઈ રહ્યું છે', hi: 'पैकिंग जारी' },
    buyer: { en: 'Being Prepared', gu: 'તૈયાર થઈ રહ્યું છે', hi: 'तैयार किया जा रहा है' },
    admin: { en: 'Packing', gu: 'પેકિંગ', hi: 'पैकिंग' },
  },
  dispatched: {
    color: 'info',
    farmer: { en: 'On the Way (Dispatched)', gu: 'રવાના કરેલ (રસ્તામાં)', hi: 'भेज दिया गया (रास्ते में)' },
    buyer: { en: 'On the Way', gu: 'રસ્તામાં છે', hi: 'रास्ते में है' },
    admin: { en: 'In Transit', gu: 'રસ્તામાં', hi: 'पारगमन में' },
  },
  delivered: {
    color: 'purple',
    farmer: { en: 'Delivered — Buyer Checking', gu: 'ડિલિવર થયેલ — ખરીદદાર તપાસે છે', hi: 'डिलीवर हुआ — खरीदार जांच रहा है' },
    buyer: { en: 'Delivered — Inspect Now', gu: 'ડિલિવર થયેલ — તપાસ કરો', hi: 'डिलीवर हुआ — निरीक्षण करें' },
    admin: { en: 'Delivered', gu: 'ડિલિવર થયેલ', hi: 'वितरित' },
  },
  inspection: {
    color: 'purple',
    farmer: { en: 'Buyer Checking Quality', gu: 'ખરીદદાર ગુણવત્તા તપાસે છે', hi: 'खरीदार गुणवत्ता जांच रहा है' },
    buyer: { en: 'Inspection Open', gu: 'તપાસ ચાલુ છે', hi: 'निरीक्षण जारी' },
    admin: { en: 'Inspection', gu: 'તપાસ', hi: 'निरीक्षण' },
  },
  completed: {
    color: 'success',
    farmer: { en: 'Completed & Paid to Bank', gu: 'પૂર્ણ થયેલ અને બેંકમાં જમા', hi: 'पूर्ण एवं बैंक में जमा' },
    buyer: { en: 'Completed', gu: 'સંપૂર્ણ', hi: 'पूर्ण' },
    admin: { en: 'Completed', gu: 'પૂર્ણ થયેલ', hi: 'पूर्ण' },
  },
  disputed: {
    color: 'error',
    farmer: { en: 'Under Review / Disputed', gu: 'વિવાદ / સમીક્ષા હેઠળ', hi: 'विवाद / समीक्षाधीन' },
    buyer: { en: 'Dispute Open', gu: 'વિવાદ નોંધાયેલ', hi: 'विवाद दर्ज' },
    admin: { en: 'Disputed', gu: 'વિવાદિત', hi: 'विवादित' },
  },
  cancelled: {
    color: 'error',
    farmer: { en: 'Cancelled', gu: 'રદ કરેલ', hi: 'रद्द किया गया' },
    buyer: { en: 'Cancelled & Refunded', gu: 'રદ અને રિફંડ થયેલ', hi: 'रद्द एवं वापस' },
    admin: { en: 'Cancelled', gu: 'રદ કરેલ', hi: 'रद्द' },
  },
  refunded: {
    color: 'error',
    farmer: { en: 'Refunded to Buyer', gu: 'ખરીદદારને રિફંડ કર્યું', hi: 'खरीदार को रिफंड किया गया' },
    buyer: { en: 'Refunded', gu: 'રિફંડ થયેલ', hi: 'रिफंड' },
    admin: { en: 'Refunded', gu: 'રિફંડ', hi: 'रिफंड' },
  },

  // Listing Statuses
  live: {
    color: 'success',
    farmer: { en: 'Live on Mandi', gu: 'મંડીમાં લાઈવ છે', hi: 'मंडी में लाइव' },
    buyer: { en: 'Available', gu: 'ઉપલબ્ધ', hi: 'उपलब्ध' },
    admin: { en: 'Live', gu: 'લાઈવ', hi: 'लाइव' },
  },
  paused: {
    color: 'warning',
    farmer: { en: 'Paused by You', gu: 'તમારા દ્વારા થોભાવેલ', hi: 'आपके द्वारा रोका गया' },
    buyer: { en: 'Temporarily Unavailable', gu: 'અસ્થાયી રૂપે અનુપલબ્ધ', hi: 'अस्थायी रूप से अनुपलब्ध' },
    admin: { en: 'Paused', gu: 'થોભાવેલ', hi: 'रोका गया' },
  },
  sold_out: {
    color: 'neutral',
    farmer: { en: 'Sold Out (Restock Available)', gu: 'સ્ટોક ખલાસ (ફરી ભરો)', hi: 'स्टॉक समाप्त (पुनः भरें)' },
    buyer: { en: 'Sold Out', gu: 'વેચાઈ ગયું', hi: 'बिक चुका' },
    admin: { en: 'Sold Out', gu: 'સ્ટોક ખલાસ', hi: 'बिक चुका' },
  },
  draft: {
    color: 'neutral',
    farmer: { en: 'Draft (Unpublished)', gu: 'ડ્રાફ્ટ (અપ્રકાશિત)', hi: 'ड्राफ्ट (अप्रकाशित)' },
    buyer: { en: 'Unavailable', gu: 'અનુપલબ્ધ', hi: 'अनुपलब्ध' },
    admin: { en: 'Draft', gu: 'ડ્રાફ્ટ', hi: 'ड्राफ्ट' },
  },
  pending_approval: {
    color: 'info',
    farmer: { en: 'Waiting for Admin Approval', gu: 'મંજૂરીની રાહ જોઈ રહ્યા છીએ', hi: 'अनुमोदन प्रतीक्षारत' },
    buyer: { en: 'Under Review', gu: 'સમીક્ષા હેઠળ', hi: 'समीक्षाधीन' },
    admin: { en: 'Pending Review', gu: 'સમીક્ષા બાકી', hi: 'समीक्षा लंबित' },
  },
  rejected: {
    color: 'error',
    farmer: { en: 'Rejected by Admin', gu: 'નામંજૂર કરેલ', hi: 'अस्वीकृत' },
    buyer: { en: 'Unavailable', gu: 'અનુપલબ્ધ', hi: 'अनुपलब्ध' },
    admin: { en: 'Rejected', gu: 'નામંજૂર', hi: 'अस्वीकृत' },
  },
};

/**
 * Get localized and role-appropriate label for any status
 */
export const getStatusLabel = (statusCode, role = 'farmer', lang = 'en') => {
  if (!statusCode) return '';
  const key = String(statusCode).toLowerCase().trim();
  const cfg = STATUS_CONFIG[key];
  if (!cfg) {
    // Fallback: title-case the string
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const roleCfg = cfg[role] || cfg.farmer || cfg.buyer || cfg.admin;
  return roleCfg[lang] || roleCfg.en || key;
};

/**
 * Get badge color variant for any status
 */
export const getStatusVariant = (statusCode) => {
  if (!statusCode) return 'neutral';
  const key = String(statusCode).toLowerCase().trim();
  const cfg = STATUS_CONFIG[key];
  return cfg?.color || 'neutral';
};

/**
 * Standard Indian Rupee Formatter (formatINR)
 * Supports values in Paise (default) or Rupees
 */
export const formatINR = (amount, isPaise = true, lang = 'en') => {
  const rupees = isPaise ? Number(amount || 0) / 100 : Number(amount || 0);
  const locale = lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  } catch (_e) {
    return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
  }
};

/**
 * Standard Quantity Formatter with Quintal/Kg conversions
 */
export const formatQty = (quantity, unit = 'Quintal', lang = 'en') => {
  const qty = Number(quantity || 0);
  const locale = lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  const formattedNumber = qty.toLocaleString(locale, { maximumFractionDigits: 2 });
  return `${formattedNumber} ${unit}`;
};

/**
 * Standard IST Date Formatter
 */
export const formatIST = (dateInput) => {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

/**
 * Standard Fee Calculator (Reconciled with Admin Ledger)
 * Commission: 2.5% on produce subtotal (seller deduction)
 * Buyer Platform Fee: 0.5% on produce subtotal (paid on top by buyer into escrow)
 */
export const calculateFeeBreakdown = (subtotalPaise) => {
  const subtotal = Number(subtotalPaise || 0);
  const sellerCommissionPct = 2.5;
  const buyerFeePct = 0.5;

  const commissionPaise = Math.round(subtotal * (sellerCommissionPct / 100));
  const buyerFeePaise = Math.round(subtotal * (buyerFeePct / 100));
  const sellerNetPayoutPaise = subtotal - commissionPaise;
  const buyerTotalEscrowPaise = subtotal + buyerFeePaise;
  const totalPlatformRevenuePaise = commissionPaise + buyerFeePaise;

  return {
    subtotalPaise: subtotal,
    commissionPaise,
    sellerCommissionPct,
    buyerFeePaise,
    buyerFeePct,
    sellerNetPayoutPaise,
    buyerTotalEscrowPaise,
    totalPlatformRevenuePaise,
  };
};

/**
 * Standard Reason Codes (Appendix A)
 */
export const REJECT_REASONS = [
  { code: 'OUT_OF_STOCK', label: 'Produce is out of stock / already sold' },
  { code: 'QUALITY_ISSUE', label: 'Harvest quality shortfall / moisture issue' },
  { code: 'PRICE_ERROR', label: 'Listing price calculation error' },
  { code: 'CANNOT_DELIVER_LOCATION', label: 'Cannot transport or facilitate pickup at this location' },
  { code: 'OTHER', label: 'Other agricultural / logistical constraint' },
];

export const STOCK_ADJUSTMENT_REASONS = [
  { code: 'RESTOCK', label: 'New harvest batch restock' },
  { code: 'SPOILAGE', label: 'Produce spoilage / moisture loss' },
  { code: 'DAMAGE', label: 'Warehouse / handling damage' },
  { code: 'OWN_USE', label: 'Personal or local village consumption' },
  { code: 'COUNT_CORRECTION', label: 'Weighment count correction' },
  { code: 'RETURNED_GOODS', label: 'Customer return accepted' },
];

export const PAUSE_REASONS = [
  { code: 'OUT_OF_STOCK', label: 'Awaiting next harvest' },
  { code: 'PRICE_REVIEW', label: 'Updating Mandi price assessment' },
  { code: 'QUALITY_CHECK', label: 'Undertaking grading / cleaning' },
  { code: 'TRAVEL', label: 'Farmer temporarily unavailable' },
  { code: 'OTHER', label: 'Other reason' },
];
