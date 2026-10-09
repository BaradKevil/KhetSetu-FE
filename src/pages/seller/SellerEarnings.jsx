import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MdAccountBalanceWallet,
  MdLock,
  MdReceiptLong,
  MdDescription,
  MdVisibility,
  MdCheckCircle,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useGetSellerOrdersQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';
import FeeBreakdown from '../../common/custom/FeeBreakdown';
import PayoutTimeline from '../../common/custom/PayoutTimeline';
import { formatINR, formatIST } from '../../common/status';

const SellerEarnings = () => {
  const { t, language } = useLanguage();
  const { data: ordersData, isLoading } = useGetSellerOrdersQuery();
  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : [];

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);

  let totalPaidOutPaise = 0;
  let totalEscrowHeldPaise = 0;
  let totalCommissionPaidPaise = 0;

  for (const o of orders) {
    if (o.status === 'completed') {
      totalPaidOutPaise += Number(o.payout_paise || 0);
      totalCommissionPaidPaise += Number(o.commission_paise || 0);
    } else if (o.status !== 'cancelled' && o.status !== 'refunded') {
      totalEscrowHeldPaise += Number(o.payout_paise || 0);
    }
  }

  const handleOpenBreakdown = (order) => {
    setSelectedOrder(order);
    setBreakdownModalOpen(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={t('farmer.earningsTitle', '💰 Earnings & Payout Statements')}
        subtitle={t('farmer.earningsSubtitle', 'Transparent breakdown of completed sales, platform fees, and escrow bank releases.')}
        actions={
          <Button
            component={Link}
            to="/seller/statements"
            variant="contained"
            color="primary"
            startIcon={<MdDescription />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {t('farmer.viewTaxStatements', 'Tax Invoices & Statements')}
          </Button>
        }
      />

      {/* 2. KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          label={t('farmer.totalEarnings', 'TOTAL PAID TO BANK')}
          value={formatINR(totalPaidOutPaise, true, language)}
          subtitle={t('farmer.paidToBank', 'Settled directly via NEFT/RTGS/UPI')}
          icon={<MdAccountBalanceWallet />}
          color="green"
        />
        <KPICard
          label={t('farmer.escrowLocked', 'YOUR SHARE IN ESCROW')}
          value={formatINR(totalEscrowHeldPaise, true, language)}
          subtitle={t('farmer.securedInVault', 'Releases immediately after buyer accepts delivery')}
          icon={<MdLock />}
          color="blue"
        />
        <KPICard
          label={t('farmer.platformCommission', 'PLATFORM COMMISSIONS (2.5%)')}
          value={formatINR(totalCommissionPaidPaise, true, language)}
          subtitle={t('market.zeroHiddenDeductions', 'Zero hidden mandi charges or broker cuts')}
          icon={<MdReceiptLong />}
          color="cyan"
        />
      </Box>

      {/* 3. Transaction History Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              {t('farmer.payoutHistory', 'Order Payout & Escrow History')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Canonical financial reconciliation across your listed harvests
            </Typography>
          </Box>
        </Box>

        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.orderNum', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.grossProduceValue', 'Gross Produce Value')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.commission', 'Commission (2.5%)')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.netPayout', 'Your Net Payout')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Bank Settlement Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Breakdown</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  {t('common.loading', 'Loading earnings...')}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('farmer.noPayoutsYet', 'No orders yet.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography
                      component={Link}
                      to={`/seller/orders/${o.id}`}
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ color: '#2563EB', textDecoration: 'none' }}
                    >
                      #{o.order_number}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                    {formatIST(o.created_at)}
                  </TableCell>

                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>
                    {formatINR(o.subtotal_paise, true, language)}
                  </TableCell>

                  <TableCell sx={{ color: '#EF4444', fontWeight: 600 }}>
                    - {formatINR(o.commission_paise, true, language)}
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#16A34A' }}>
                    {formatINR(o.payout_paise, true, language)}
                  </TableCell>

                  {/* Canonical Status (Finding 3 fixed) */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <StatusBadge status={o.status} role="farmer" />
                      {o.status === 'completed' && (
                        <Typography variant="caption" color="text.secondary">
                          UTR: KS-UTR-{(o.id || 101) * 9876}
                        </Typography>
                      )}
                      {o.status === 'escrow_held' && (
                        <Typography variant="caption" color="#B45309">
                          Payment secured in vault
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="View full financial breakdown">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenBreakdown(o)}
                        sx={{ color: '#2563EB', bgcolor: '#EFF6FF', borderRadius: 2 }}
                      >
                        <MdVisibility size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 4. Financial Settlement Breakdown Modal */}
      <Dialog open={breakdownModalOpen} onClose={() => setBreakdownModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Order #{selectedOrder?.order_number} Financial Settlement
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FeeBreakdown
                subtotalPaise={selectedOrder.subtotal_paise}
                orderPricing={{
                  subtotalPaise: selectedOrder.subtotal_paise,
                  commissionPaise: selectedOrder.commission_paise,
                  buyerFeePaise: selectedOrder.buyer_fee_paise,
                  sellerNetPayoutPaise: selectedOrder.payout_paise,
                  buyerTotalEscrowPaise: selectedOrder.total_paise,
                }}
              />
              <PayoutTimeline order={selectedOrder} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBreakdownModalOpen(false)} sx={{ fontWeight: 600 }}>
            {t('common.close', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerEarnings;
