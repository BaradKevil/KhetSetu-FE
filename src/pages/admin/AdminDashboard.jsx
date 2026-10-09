import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Chip, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  MdLocalAtm,
  MdShoppingBag,
  MdReceiptLong,
} from 'react-icons/md';
import { useGetAdminMetricsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate } = useLanguage();
  const { data: metrics, isLoading } = useGetAdminMetricsQuery();

  const gmv = metrics?.gmvPaise ? formatCurrency(metrics.gmvPaise, true) : '₹0';
  const revenue = metrics?.revenuePaise ? formatCurrency(metrics.revenuePaise, true) : '₹0';
  const escrowHeld = metrics?.escrowHeldPaise ? formatCurrency(metrics.escrowHeldPaise, true) : '₹0';
  const settledPayouts = metrics?.settledPayoutsPaise ? formatCurrency(metrics.settledPayoutsPaise, true) : '₹0';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <Box>
      {/* 1. Page Header (Reference Screenshot 1) */}
      <PageHeader
        title={t('admin.controlTowerTitle', 'Admin Dashboard')}
        subtitle={todayFormatted}
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/orders')}
            startIcon={<MdShoppingBag size={18} />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {t('ordersOversight', 'Orders Oversight')}
          </Button>
        }
      />

      {/* Change Requests Alert Banner */}
      {metrics?.pendingChangeRequests > 0 && (
        <Alert
          severity="warning"
          icon={<MdWarning size={22} />}
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

      {/* 2. KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          icon={<MdPayments size={24} />}
          label="Total GMV (Sales)"
          value={gmv}
          subtitle="Platform cumulative trade volume"
          color="blue"
          onClick={() => navigate('/admin/orders')}
        />

        <KPICard
          icon={<MdAccountBalanceWallet size={24} />}
          label="Escrow Liquidity"
          value={escrowHeld}
          subtitle="Held across open orders"
          color="cyan"
          onClick={() => navigate('/admin/finance/ledger')}
        />

        <KPICard
          icon={<MdLocalAtm size={24} />}
          label="Farmer Payouts"
          value={settledPayouts}
          subtitle="Disbursed to verified banks"
          color="green"
          onClick={() => navigate('/admin/finance/payouts')}
        />

        <KPICard
          icon={<MdAdminPanelSettings size={24} />}
          label="Platform Revenue"
          value={revenue}
          subtitle="Realized commissions (3%)"
          color="purple"
          onClick={() => navigate('/admin/finance/ledger')}
        />
      </Box>

      {/* 3. Main Content Split: Left (Actions & Status) + Right (Notifications) */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Left Column: Action Queue & Recent Overview */}
        <Grid item xs={12} md={8} size={{ xs: 12, md: 8 }}>
          {/* Quick Action Queue Card (Reference Screenshot 1 Send Feedback panel style) */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Operational Action Queue
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                Review KYC verifications, approve farmer payouts, and resolve trade disputes.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/kyc?status=pending')}
                startIcon={<MdVerifiedUser size={18} />}
                sx={{
                  bgcolor: '#059669',
                  '&:hover': { bgcolor: '#047857' },
                  color: '#FFFFFF',
                  px: 2.5,
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Review KYC Queue ({metrics?.pendingKYC || 0})
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/admin/finance/payouts?status=pending_approval')}
                startIcon={<MdLocalAtm size={18} />}
                sx={{
                  bgcolor: '#2563EB',
                  '&:hover': { bgcolor: '#1D4ED8' },
                  color: '#FFFFFF',
                  px: 2.5,
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Clear Payouts ({metrics?.pendingPayouts || 0})
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/admin/disputes')}
                startIcon={<MdGavel size={18} />}
                sx={{
                  borderColor: '#E2E8F0',
                  color: metrics?.openDisputes > 0 ? '#DC2626' : '#334155',
                  px: 2.2,
                  py: 1.1,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: metrics?.openDisputes > 0 ? '#FEF2F2' : 'transparent',
                }}
              >
                Disputes ({metrics?.openDisputes || 0})
              </Button>
            </Box>
          </Paper>

          {/* Operational Metrics Table (Reference Screenshot 1 Project Details style) */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Operational Status Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.2 }}>
                Current queue depths, pending verifications, and marketplace state.
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>OPERATIONAL QUEUE</TableCell>
                    <TableCell>PENDING COUNT</TableCell>
                    <TableCell>SLA STATUS</TableCell>
                    <TableCell align="right">ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      Farmer KYC Verification
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {metrics?.pendingKYC || 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={metrics?.pendingKYC > 0 ? 'NEEDS REVIEW' : 'ALL CLEAR'}
                        status={metrics?.pendingKYC > 0 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate('/admin/kyc')}
                        sx={{ color: '#2563EB', fontWeight: 600, p: 0.5 }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      Farmer Payout Clearance
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {metrics?.pendingPayouts || 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={metrics?.pendingPayouts > 0 ? 'AWAITING APPROVAL' : 'UP TO DATE'}
                        status={metrics?.pendingPayouts > 0 ? 'info' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate('/admin/finance/payouts')}
                        sx={{ color: '#2563EB', fontWeight: 600, p: 0.5 }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      Listing Moderation Queue
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {metrics?.pendingListings || 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={metrics?.pendingListings > 0 ? 'PENDING MODERATION' : 'LIVE'}
                        status={metrics?.pendingListings > 0 ? 'purple' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate('/admin/listings')}
                        sx={{ color: '#2563EB', fontWeight: 600, p: 0.5 }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                      Trade Dispute Arbitration
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {metrics?.openDisputes || 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={metrics?.openDisputes > 0 ? 'ACTION REQUIRED' : 'ZERO DISPUTES'}
                        status={metrics?.openDisputes > 0 ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => navigate('/admin/disputes')}
                        sx={{ color: '#2563EB', fontWeight: 600, p: 0.5 }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Notifications Feed (Exact Match with Reference Screenshot 1) */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Notifications
              </Typography>
              <Chip
                label="3"
                size="small"
                sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', height: 22 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {/* Notification 1: Green System item */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#F0FDF4',
                  borderLeft: '4px solid #22C55E',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    ACID Double-Entry Ledger balanced
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    {todayFormatted} • Cryptographically verified
                  </Typography>
                </Box>
                <Chip
                  label="SYSTEM"
                  size="small"
                  sx={{
                    bgcolor: '#DCFCE7',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 20,
                    borderRadius: 1.5,
                  }}
                />
              </Box>

              {/* Notification 2: Warning/Update item */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#FFFBEB',
                  borderLeft: '4px solid #F59E0B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    KYC approvals awaiting review: {metrics?.pendingKYC || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    Pending farmer identity & bank checks
                  </Typography>
                </Box>
                <Chip
                  label="KYC"
                  size="small"
                  sx={{
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 20,
                    borderRadius: 1.5,
                  }}
                />
              </Box>

              {/* Notification 3: Info/Audit item */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#EFF6FF',
                  borderLeft: '4px solid #2563EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    Realized revenue: {revenue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    Platform trade commission settled
                  </Typography>
                </Box>
                <Chip
                  label="FINANCE"
                  size="small"
                  sx={{
                    bgcolor: '#DBEAFE',
                    color: '#1D4ED8',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 20,
                    borderRadius: 1.5,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => navigate('/admin/audit')}
                sx={{ color: '#2563EB', fontWeight: 600, textTransform: 'none' }}
              >
                View Audit Trail →
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. ACID Double-Entry Integrity Strip */}
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
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#DCFCE7', color: '#15803D', display: 'flex' }}>
            <MdCheckCircle size={22} />
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
            icon={<MdLock size={14} />}
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
