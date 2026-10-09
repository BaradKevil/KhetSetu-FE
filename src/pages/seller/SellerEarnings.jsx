import { Box, Typography, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { MdAccountBalanceWallet, MdLock, MdReceiptLong } from 'react-icons/md';
import { useGetSellerOrdersQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const SellerEarnings = () => {
  const { t, formatCurrency } = useLanguage();
  const { data: ordersData, isLoading } = useGetSellerOrdersQuery();
  const orders = ordersData?.items || [];

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

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('farmer.earningsTitle', '💰 Earnings & Payout Statements')}
        subtitle={t('farmer.earningsSubtitle', 'Transparent breakdown of completed sales, platform fees, and escrow bank releases.')}
      />

      {/* KPI Cards Row (Uniform full-width grid) */}
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
          value={formatCurrency(totalPaidOutPaise, true)}
          subtitle={t('farmer.paidToBank', 'Settled directly via NEFT/RTGS/UPI')}
          icon={<MdAccountBalanceWallet />}
          color="green"
        />
        <KPICard
          label={t('farmer.escrowLocked', 'LOCKED IN ESCROW')}
          value={formatCurrency(totalEscrowHeldPaise, true)}
          subtitle={t('farmer.securedInVault', 'Will release as soon as buyers receive delivery')}
          icon={<MdLock />}
          color="blue"
        />
        <KPICard
          label={t('farmer.platformCommission', 'PLATFORM COMMISSIONS (2.5%)')}
          value={formatCurrency(totalCommissionPaidPaise, true)}
          subtitle={t('market.zeroHiddenDeductions', 'No hidden brokerages or mandi deductions')}
          icon={<MdReceiptLong />}
          color="cyan"
        />
      </Box>

      {/* Transaction History Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            {t('farmer.payoutHistory', 'Order Payout History')}
          </Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.orderNum', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.grossProduceValue', 'Gross Produce Value')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.commission', 'Commission (2.5%)')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.netPayout', 'Net Payout (You Receive)')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.status', 'Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {t('common.loading', 'Loading earnings...')}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('farmer.noPayoutsYet', 'No orders yet.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>#{o.order_number}</TableCell>
                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>{formatCurrency(o.subtotal_paise, true)}</TableCell>
                  <TableCell sx={{ color: '#EF4444', fontWeight: 600 }}>- {formatCurrency(o.commission_paise, true)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#16A34A' }}>
                    {formatCurrency(o.payout_paise, true)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status === 'completed' ? 'completed' : 'pending'} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default SellerEarnings;
