import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import { MdCheckCircle, MdInfoOutline } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, calculateFeeBreakdown } from '../status';

/**
 * Reusable FeeBreakdown component
 * Reconciled across Farmer, Buyer and Admin panels
 * Clearly shows:
 * - Produce Goods Value (Subtotal)
 * - Seller Commission (2.5%)
 * - Net Farmer Payout
 * - Buyer Platform Fee (0.5%) paid on top into escrow
 * - Total Paid by Buyer
 */
const FeeBreakdown = ({ subtotalPaise, orderPricing, sx = {} }) => {
  const { language, t } = useLanguage();

  const pricing = orderPricing || calculateFeeBreakdown(subtotalPaise);
  const subtotal = pricing.subtotalPaise || pricing.goodsPaise || subtotalPaise || 0;
  const commission = pricing.commissionPaise || pricing.sellerCommissionPaise || Math.round(subtotal * 0.025);
  const netPayout = pricing.sellerNetPayoutPaise || pricing.sellerNetPaise || (subtotal - commission);
  const buyerFee = pricing.buyerFeePaise || Math.round(subtotal * 0.005);
  const totalEscrow = pricing.buyerTotalEscrowPaise || pricing.buyerTotalPaise || (subtotal + buyerFee);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
          {t('feeBreakdown.title', 'Financial Settlement Breakdown')}
        </Typography>
        <Chip
          icon={<MdCheckCircle size={14} color="#16A34A" />}
          label={t('feeBreakdown.zeroHidden', 'Zero Hidden Deductions')}
          size="small"
          sx={{
            bgcolor: '#DCFCE7',
            color: '#166534',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: 1.5,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="#475569">
            {t('feeBreakdown.goodsValue', 'Gross Produce Value')}
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#0F172A">
            {formatINR(subtotal, true, language)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="#475569">
            {t('feeBreakdown.commission', 'Platform Commission (2.5%)')}
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#DC2626">
            - {formatINR(commission, true, language)}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5, borderColor: '#F1F5F9' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
            bgcolor: '#F0FDF4',
            borderRadius: 2,
            border: '1px solid #DCFCE7',
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#166534">
              {t('feeBreakdown.netPayout', 'Your Net Bank Payout')}
            </Typography>
            <Typography variant="caption" color="#15803D">
              {t('feeBreakdown.payoutNote', 'Disbursed directly via NEFT/UPI upon delivery')}
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} color="#16A34A">
            {formatINR(netPayout, true, language)}
          </Typography>
        </Box>

        {/* Transparent Buyer Escrow Disclosure */}
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: '#F8FAFC',
            borderRadius: 2,
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.2,
          }}
        >
          <MdInfoOutline size={18} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" display="block">
              {t('feeBreakdown.buyerEscrowNote', 'Total Escrow Held by Platform')}: {formatINR(totalEscrow, true, language)}
            </Typography>
            <Typography variant="caption" color="#64748B">
              {t(
                'feeBreakdown.escrowExplainer',
                'Buyer paid produce value plus a 0.5% platform gateway fee. 100% of your net amount is locked securely until delivery.'
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default FeeBreakdown;
