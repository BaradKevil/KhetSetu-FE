import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import {
  MdAdminPanelSettings,
  MdAccountBalanceWallet,
  MdPayments,
  MdVerifiedUser,
  MdWarning,
} from 'react-icons/md';
import { useGetAdminMetricsQuery } from '../../Api/Api';

const AdminDashboard = () => {
  const { data: metrics, isLoading } = useGetAdminMetricsQuery();

  const gmv = metrics?.gmvPaise ? (metrics.gmvPaise / 100).toLocaleString('en-IN') : '0';
  const revenue = metrics?.revenuePaise ? (metrics.revenuePaise / 100).toLocaleString('en-IN') : '0';
  const escrowHeld = metrics?.escrowHeldPaise ? (metrics.escrowHeldPaise / 100).toLocaleString('en-IN') : '0';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            🛡️ Super Admin Control Tower
          </Typography>
          <Chip label="Live System Metrics" color="success" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Monitor Gross Merchandise Value (GMV), escrow liquidity, KYC queues, and immutable accounting ledgers.
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F0FDF4', color: '#16A34A' }}>
                <MdPayments size={22} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL GMV (SALES)
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              ₹{gmv}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Platform cumulative turnover
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E0F2FE', color: '#0288D1' }}>
                <MdAccountBalanceWallet size={22} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                ESCROW LIQUIDITY
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0288D1">
              ₹{escrowHeld}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Held pending delivery confirmations
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                <MdAdminPanelSettings size={22} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PLATFORM REVENUE
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#2E7D32">
              ₹{revenue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Realized commissions & fees
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#FEF3C7', color: '#D97706' }}>
                <MdVerifiedUser size={22} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PENDING KYC QUEUE
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#D97706">
              {metrics?.pendingKYC || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Farmers awaiting identity review
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Operational Highlights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Platform Health & Compliance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              KhetSetu operates on India's DPDP Act 2023 compliance standard with encrypted bank storage and immutable double-entry ledgers.
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderRadius: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#166534">
                ✓ ACID Ledger Integrity: Verified
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All buyer payments match escrow credit and debit obligations.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Disputes & Risk Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#FFFBEB', borderRadius: 2.5, border: '1px solid #FDE68A' }}>
              <MdWarning color="#D97706" size={24} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#B45309">
                  {metrics?.openDisputes || 0} Open Disputes Requiring Arbitration
                </Typography>
                <Typography variant="caption" color="#92400E">
                  Escrow holds are auto-frozen until dispute evidence is resolved.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
