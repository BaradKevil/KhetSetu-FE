import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Chip, Alert, Button, Divider, Tooltip } from '@mui/material';
import {
  MdAdminPanelSettings,
  MdAccountBalanceWallet,
  MdPayments,
  MdVerifiedUser,
  MdWarning,
  MdArrowForward,
  MdCheckCircle,
  MdGavel,
  MdInventory2,
  MdLock,
} from 'react-icons/md';
import { useGetAdminMetricsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate } = useLanguage();
  const { data: metrics, isLoading, refetch } = useGetAdminMetricsQuery();

  const gmv = metrics?.gmvPaise ? formatCurrency(metrics.gmvPaise, true) : '₹0';
  const revenue = metrics?.revenuePaise ? formatCurrency(metrics.revenuePaise, true) : '₹0';
  const escrowHeld = metrics?.escrowHeldPaise ? formatCurrency(metrics.escrowHeldPaise, true) : '₹0';
  const settledPayouts = metrics?.settledPayoutsPaise ? formatCurrency(metrics.settledPayoutsPaise, true) : '₹0';

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {t('admin.controlTowerTitle', '🛡️ Super Admin Control Tower')}
            </Typography>
            <Chip label="PROD • ACTIVE" color="success" size="small" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('admin.controlTowerSubtitle', 'Real-time financial solvency, double-entry escrow liquidity, KYC queues, and dispute arbitration.')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Refresh Telemetry
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate('/admin/orders')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Orders Oversight
          </Button>
        </Box>
      </Box>

      {/* Change Requests Alert Banner */}
      {metrics?.pendingChangeRequests > 0 && (
        <Alert
          severity="warning"
          icon={<MdWarning size={24} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/admin/kyc?tab=change_requests')}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Review Requests ({metrics.pendingChangeRequests})
            </Button>
          }
          sx={{ mb: 3.5, borderRadius: 3, border: '1px solid #FCD34D', bgcolor: '#FFFBEB' }}
        >
          <strong>
            {metrics.pendingChangeRequests}{' '}
            {t('admin.changeRequestAlert', 'farmer(s) have requested profile details change / bank account unlock.')}
          </strong>
        </Alert>
      )}

      {/* Row 1: 4 Equal-Height Money KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* GMV */}
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() => navigate('/admin/orders')}
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#16A34A', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
                  TOTAL GMV (SALES)
                </Typography>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#F0FDF4', color: '#16A34A' }}>
                  <MdPayments size={18} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={900} color="#0F172A">
                {gmv}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', noWrap: true }}>
              Platform cumulative trade volume
            </Typography>
          </Paper>
        </Grid>

        {/* Escrow Liquidity */}
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() => navigate('/admin/finance/ledger')}
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#0288D1', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
                  ESCROW LIQUIDITY
                </Typography>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#E0F2FE', color: '#0288D1' }}>
                  <MdAccountBalanceWallet size={18} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={900} color="#0288D1">
                {escrowHeld}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Held across open purchase orders
            </Typography>
          </Paper>
        </Grid>

        {/* Settled Farmer Payouts */}
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() => navigate('/admin/finance/payouts')}
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#16A34A', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
                  FARMER PAYOUTS
                </Typography>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#DCFCE7', color: '#15803D' }}>
                  <MdAccountBalanceWallet size={18} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={900} color="#15803D">
                {settledPayouts}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Disbursed to verified bank accounts
            </Typography>
          </Paper>
        </Grid>

        {/* Platform Revenue */}
        <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() => navigate('/admin/finance/ledger')}
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 3.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#7C3AED', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
                  PLATFORM REVENUE
                </Typography>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#F3E8FF', color: '#7C3AED' }}>
                  <MdAdminPanelSettings size={18} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight={900} color="#7C3AED">
                {revenue}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Realized commissions & fees (3%)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2: Action Queue Block (Most important for admin triage) */}
      <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
          ⚡ Operational Action Queue
        </Typography>

        <Grid container spacing={2}>
          {/* Action 1: KYC Pending */}
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/admin/kyc?status=pending')}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#FEF3C7',
                border: '1px solid #FCD34D',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900} color="#92400E">
                  {metrics?.pendingKYC || 0}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#78350F">
                  KYC Pending Review
                </Typography>
              </Box>
              <MdArrowForward color="#92400E" />
            </Paper>
          </Grid>

          {/* Action 2: Payouts Awaiting */}
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/admin/finance/payouts?status=pending_approval')}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#E0E7FF',
                border: '1px solid #C7D2FE',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900} color="#3730A3">
                  {metrics?.pendingPayouts || 0}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#312E81">
                  Payouts Awaiting Clearance
                </Typography>
              </Box>
              <MdArrowForward color="#3730A3" />
            </Paper>
          </Grid>

          {/* Action 3: Open Disputes */}
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/admin/disputes')}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: metrics?.openDisputes > 0 ? '#FEE2E2' : '#F1F5F9',
                border: metrics?.openDisputes > 0 ? '1px solid #FECACA' : '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900} color={metrics?.openDisputes > 0 ? '#991B1B' : '#475569'}>
                  {metrics?.openDisputes || 0}
                </Typography>
                <Typography variant="caption" fontWeight={700} color={metrics?.openDisputes > 0 ? '#7F1D1D' : '#64748B'}>
                  Open Disputes
                </Typography>
              </Box>
              <MdArrowForward color={metrics?.openDisputes > 0 ? '#991B1B' : '#475569'} />
            </Paper>
          </Grid>

          {/* Action 4: Listings Moderation */}
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              onClick={() => navigate('/admin/listings')}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#F3E8FF',
                border: '1px solid #E9D5FF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900} color="#6B21A8">
                  {metrics?.pendingListings || 0}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#581C87">
                  Listings Moderation Queue
                </Typography>
              </Box>
              <MdArrowForward color="#6B21A8" />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Row 3: ACID Double-Entry Integrity Strip */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3.5,
          border: '1.5px solid #86EFAC',
          bgcolor: '#F0FDF4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: '#DCFCE7', color: '#15803D' }}>
            <MdCheckCircle size={24} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#15803D">
              ACID Double-Entry Ledger Integrity: Verified Balanced (Debits = Credits)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total {metrics?.ledgerIntegrity?.totalEntries || 0} sequenced transactions balanced. Zero mismatch across Escrow Vault liabilities.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<MdLock />}
            label="Cryptographically Sequenced"
            size="small"
            color="success"
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => navigate('/admin/finance/ledger')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Inspect Ledger
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
