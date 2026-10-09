import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  MdSave,
  MdWarning,
  MdSecurity,
  MdAccountBalance,
  MdTimer,
  MdPercent,
} from 'react-icons/md';
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from '../../Api/Api';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const AdminSettings = () => {
  const { data: settingsData, isLoading } = useGetPlatformSettingsQuery();
  const updateSettingsMutation = useUpdatePlatformSettingsMutation();

  const [form, setForm] = useState({
    commission_rate: 3.0,
    escrow_fee_rate: 1.5,
    tax_rate: 5.0,
    auto_release_hours: 48,
    dispute_window_hours: 24,
    min_payout_threshold: 500,
    payout_kill_switch: false,
  });

  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState('');

  useEffect(() => {
    if (settingsData) {
      setForm({
        commission_rate: Number(settingsData.commission_rate ?? 3.0),
        escrow_fee_rate: Number(settingsData.escrow_fee_rate ?? 1.5),
        tax_rate: Number(settingsData.tax_rate ?? 5.0),
        auto_release_hours: Number(settingsData.auto_release_hours ?? 48),
        dispute_window_hours: Number(settingsData.dispute_window_hours ?? 24),
        min_payout_threshold: Number(settingsData.min_payout_threshold ?? 500),
        payout_kill_switch: Boolean(settingsData.payout_kill_switch),
      });
    }
  }, [settingsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(form);
      toast.success('Platform parameters and financial configurations saved successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update settings.');
    }
  };

  const handleToggleKillSwitch = async () => {
    if (!killSwitchReason.trim()) {
      toast.error('A mandatory justification is required to activate/deactivate the Payout Kill-Switch.');
      return;
    }

    try {
      const nextKillSwitchState = !form.payout_kill_switch;
      await updateSettingsMutation.mutateAsync({
        ...form,
        payout_kill_switch: nextKillSwitchState,
        kill_switch_reason: killSwitchReason,
      });
      setForm((prev) => ({ ...prev, payout_kill_switch: nextKillSwitchState }));
      setKillSwitchModalOpen(false);
      setKillSwitchReason('');
      toast.warn(`Emergency Payout Kill-Switch has been ${nextKillSwitchState ? 'ACTIVATED (PAYOUTS FROZEN)' : 'DEACTIVATED'}.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update kill-switch state.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200 }}>
      {/* Page Header (Reference Design) */}
      <PageHeader
        title="Platform Configuration & Financial Parameters"
        subtitle="Global escrow fees, tax deductions, automated SLA timers, and emergency risk controls."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdSave size={18} />}
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Parameters'}
          </Button>
        }
      />

      {/* 3 KPI Cards (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 3,
          width: '100%',
        }}
      >
        <KPICard
          icon={<MdPercent size={24} />}
          label="Platform Commission"
          value={`${form.commission_rate}%`}
          color="blue"
        />
        <KPICard
          icon={<MdTimer size={24} />}
          label="Auto-Release SLA Window"
          value={`${form.auto_release_hours}h`}
          color="purple"
        />
        <KPICard
          icon={<MdSecurity size={24} />}
          label="Payout Kill-Switch"
          value={form.payout_kill_switch ? 'ACTIVE' : 'NORMAL'}
          color={form.payout_kill_switch ? 'red' : 'green'}
        />
      </Box>

      {/* Emergency Kill Switch Banner */}
      {form.payout_kill_switch ? (
        <Alert
          severity="error"
          icon={<MdWarning size={28} />}
          sx={{ mb: 3.5, borderRadius: 3, border: '2px solid #DC2626', bgcolor: '#FEF2F2' }}
        >
          <Typography variant="subtitle1" fontWeight={800} color="#991B1B">
            ⚠️ EMERGENCY PAYOUT KILL-SWITCH IS CURRENTLY ACTIVE!
          </Typography>
          <Typography variant="body2" color="#B91C1C" sx={{ mt: 0.5 }}>
            All outgoing bank transfers, UPI payouts, and automated escrow settlements are strictly blocked across the platform.
          </Typography>
        </Alert>
      ) : null}

      {/* Section 1: Financial & Escrow Commission Rates */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <MdPercent size={24} color="#16A34A" />
          <Typography variant="h6" fontWeight={800} color="#0F172A">
            Marketplace Commission & Deductions
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These percentages are calculated in integer paise at order placement and booked to platform ledger accounts.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Platform Commission (KhetSetu)"
              name="commission_rate"
              value={form.commission_rate}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Charged on gross order value (Default: 3.00%)"
            />
          </Grid>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Buyer Escrow Protection Fee"
              name="escrow_fee_rate"
              value={form.escrow_fee_rate}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Escrow vault maintenance fee (Default: 1.50%)"
            />
          </Grid>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Applicable GST / Agri Cess"
              name="tax_rate"
              value={form.tax_rate}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Tax liability on platform revenue (Default: 5.00%)"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Section 2: SLA Timers & Payout Thresholds */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <MdTimer size={24} color="#2563EB" />
          <Typography variant="h6" fontWeight={800} color="#0F172A">
            Escrow SLA Timers & Liquidity Rules
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Controls the automated transition of funds from <code>ESCROW_HOLD_LIABILITY</code> to seller payout queue.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Auto-Release SLA Window"
              name="auto_release_hours"
              value={form.auto_release_hours}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">Hours</InputAdornment>,
              }}
              helperText="Hours after delivery before funds auto-release (Default: 48h)"
            />
          </Grid>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Dispute Raising Window"
              name="dispute_window_hours"
              value={form.dispute_window_hours}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">Hours</InputAdornment>,
              }}
              helperText="Window for buyer to file complaint after delivery (Default: 24h)"
            />
          </Grid>
          <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Min Farmer Payout Threshold"
              name="min_payout_threshold"
              value={form.min_payout_threshold}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="Minimum balance required to trigger bank transfer (Default: ₹500)"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Section 3: Emergency Kill-Switch & Risk Controls */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3.5, border: '2px solid #FCA5A5', bgcolor: '#FFFBFB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <MdSecurity size={24} color="#DC2626" />
          <Typography variant="h6" fontWeight={800} color="#991B1B">
            Circuit Breaker: Emergency Payout Kill-Switch
          </Typography>
        </Box>
        <Typography variant="body2" color="#7F1D1D" sx={{ mb: 2.5 }}>
          Immediately halts all outgoing banking API requests and disallows settlement approvals. Use in case of suspected security anomalies, bank ledger imbalances, or payment gateway rate limits.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #FECACA' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color={form.payout_kill_switch ? '#DC2626' : '#166534'}>
              {form.payout_kill_switch ? 'PAYOUTS HARD-FROZEN (ACTIVE)' : 'PAYOUT SUBSYSTEM OPERATIONAL (NORMAL)'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Toggle requires 2-step administrative confirmation and reason recording.
            </Typography>
          </Box>
          <Button
            variant={form.payout_kill_switch ? 'contained' : 'outlined'}
            color={form.payout_kill_switch ? 'success' : 'error'}
            onClick={() => setKillSwitchModalOpen(true)}
            sx={{ fontWeight: 800 }}
          >
            {form.payout_kill_switch ? 'Deactivate Kill-Switch' : 'Trigger Kill-Switch'}
          </Button>
        </Box>
      </Paper>

      {/* Kill Switch Confirmation Dialog */}
      <Dialog open={killSwitchModalOpen} onClose={() => setKillSwitchModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#991B1B' }}>
          {form.payout_kill_switch ? 'Deactivate Payout Circuit Breaker?' : '⚠️ ACTIVATE EMERGENCY PAYOUT KILL-SWITCH?'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {form.payout_kill_switch
              ? 'This will resume normal processing of farmer payouts and automated bank transfers.'
              : 'CRITICAL: Activating the Kill-Switch will instantly freeze all pending and automated payouts across the platform. No funds will leave the escrow account until deactivated.'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mandatory Operational Reason"
            placeholder="Explain the incident, gateway issue, or maintenance need..."
            value={killSwitchReason}
            onChange={(e) => setKillSwitchReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setKillSwitchModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={form.payout_kill_switch ? 'success' : 'error'}
            onClick={handleToggleKillSwitch}
            disabled={!killSwitchReason.trim()}
            sx={{ fontWeight: 700 }}
          >
            {form.payout_kill_switch ? 'Resume Payouts' : 'Enforce Immediate Freeze'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
