import { Box, Typography, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { MdAccountBalance, MdSecurity } from 'react-icons/md';
import { useGetSellerOrdersQuery } from '../../Api/Api';

const SellerEarnings = () => {
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
          💰 Earnings & Payout Statements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Transparent breakdown of completed sales, platform fees, and escrow bank releases.
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              TOTAL PAID TO BANK
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#2E7D32" sx={{ my: 1 }}>
              ₹{(totalPaidOutPaise / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Settled directly via NEFT/RTGS/UPI
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              LOCKED IN ESCROW
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0288D1" sx={{ my: 1 }}>
              ₹{(totalEscrowHeldPaise / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Will release as soon as buyers receive delivery
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              PLATFORM COMMISSIONS (2.5%)
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#475569" sx={{ my: 1 }}>
              ₹{(totalCommissionPaidPaise / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hidden brokerages or mandi deductions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" fontWeight={700}>
            Order Payout History
          </Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Gross Produce Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Commission (2.5%)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Payout (You Receive)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Loading earnings...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No orders yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>#{o.order_number}</TableCell>
                  <TableCell>₹{(o.subtotal_paise / 100).toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ color: '#DC2626' }}>- ₹{(o.commission_paise / 100).toLocaleString('en-IN')}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    ₹{(o.payout_paise / 100).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={o.status === 'completed' ? 'RELEASED' : 'ESCROW HOLD'}
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
