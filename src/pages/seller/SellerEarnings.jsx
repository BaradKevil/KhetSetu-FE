import { Box, Typography, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { useGetSellerOrdersQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

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
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('farmer.earningsTitle', '💰 Earnings & Payout Statements')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('farmer.earningsSubtitle', 'Transparent breakdown of completed sales, platform fees, and escrow bank releases.')}
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {t('farmer.totalEarnings', 'TOTAL PAID TO BANK')}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#2E7D32" sx={{ my: 1 }}>
              {formatCurrency(totalPaidOutPaise, true)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('farmer.paidToBank', 'Settled directly via NEFT/RTGS/UPI')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {t('farmer.escrowLocked', 'LOCKED IN ESCROW')}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0288D1" sx={{ my: 1 }}>
              {formatCurrency(totalEscrowHeldPaise, true)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('farmer.securedInVault', 'Will release as soon as buyers receive delivery')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {t('farmer.platformCommission', 'PLATFORM COMMISSIONS (2.5%)')}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#475569" sx={{ my: 1 }}>
              {formatCurrency(totalCommissionPaidPaise, true)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('market.zeroHiddenDeductions', 'No hidden brokerages or mandi deductions')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" fontWeight={700}>
            {t('farmer.payoutHistory', 'Order Payout History')}
          </Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.orderNum', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.grossProduceValue', 'Gross Produce Value')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.commission', 'Commission (2.5%)')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.netPayout', 'Net Payout (You Receive)')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Status')}</TableCell>
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
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>#{o.order_number}</TableCell>
                  <TableCell>{formatCurrency(o.subtotal_paise, true)}</TableCell>
                  <TableCell sx={{ color: '#DC2626' }}>- {formatCurrency(o.commission_paise, true)}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    {formatCurrency(o.payout_paise, true)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={o.status === 'completed' ? t('common.completed', 'RELEASED') : t('farmer.escrowLocked', 'ESCROW HOLD')}
                      size="small"
                      color={o.status === 'completed' ? 'success' : 'warning'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
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
