import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import {
  MdGavel,
  MdAdd,
  MdSecurity,
  MdReportProblem,
  MdHourglassEmpty,
  MdCheckCircle,
} from 'react-icons/md';
import {
  useGetBuyerDisputesQuery,
  useRaiseDisputeMutation,
  useGetBuyerOrdersQuery,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const BuyerDisputes = () => {
  const [searchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get('order_id');
  const { t, formatCurrency, formatDate } = useLanguage();

  const { data: disputesData, isLoading } = useGetBuyerDisputesQuery();
  const { data: ordersData } = useGetBuyerOrdersQuery({ limit: 50 });
  const raiseDisputeMutation = useRaiseDisputeMutation();

  const disputes = Array.isArray(disputesData) ? disputesData : [];
  const orders = ordersData?.items || [];

  const [modalOpen, setModalOpen] = useState(Boolean(preselectedOrderId));
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId || '');
  const [reason, setReason] = useState('Quality grade below specification');
  const [details, setDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  useEffect(() => {
    if (preselectedOrderId) {
      setSelectedOrderId(preselectedOrderId);
      setModalOpen(true);
    }
  }, [preselectedOrderId]);

  const handleFileDispute = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order to dispute');
      return;
    }
    if (!details || details.trim().length < 10) {
      toast.error('Please provide a detailed explanation (minimum 10 characters)');
      return;
    }

    try {
      await raiseDisputeMutation.mutateAsync({
        order_id: Number(selectedOrderId),
        reason,
        details,
        evidence_images: evidenceUrl ? [evidenceUrl.trim()] : [],
      });
      toast.success('Dispute filed successfully! Platform arbitration officers will review within 24 hours.');
      setModalOpen(false);
      setDetails('');
      setEvidenceUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error filing dispute');
    }
  };

  const totalDisputes = disputes.length;
  const openClaims = disputes.filter((d) => ['open', 'under_review'].includes(d.status)).length;
  const resolvedCases = disputes.filter((d) => d.status.startsWith('resolved')).length;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title="⚖️ Disputes & Escrow Arbitration"
        subtitle="Protect your capital when harvest deliveries deviate from contracted grade, moisture, or weight specs."
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<MdReportProblem />}
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, py: 1 }}
          >
            File Quality Dispute
          </Button>
        }
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
          label="Total Disputes"
          value={totalDisputes}
          subtitle="All-time dispute cases"
          icon={<MdGavel />}
          color="blue"
        />
        <KPICard
          label="Open Claims"
          value={openClaims}
          subtitle="Under active arbitration"
          icon={<MdHourglassEmpty />}
          color="amber"
        />
        <KPICard
          label="Resolved Cases"
          value={resolvedCases}
          subtitle="Completed arbitrations"
          icon={<MdCheckCircle />}
          color="green"
        />
      </Box>

      {/* Escrow Arbitration Policy Banner */}
      <Alert severity="info" icon={<MdSecurity size={22} />} sx={{ mb: 3.5, borderRadius: 2.5, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
        <strong>Escrow Safety Lock:</strong> When a dispute is filed, platform funds are frozen in the escrow vault. The farmer is not paid until independent arbitration verifies weighing slips, moisture lab reports, and photo evidence.
      </Alert>

      {/* Disputes Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Dispute Case #</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Reason / Claim</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Filing Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Escrow Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : disputes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
                    <MdGavel size={42} color="#94A3B8" />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, color: '#0F172A' }}>
                      No Active or Past Disputes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      All your previous escrow orders completed smoothly without quality or weight claims.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              disputes.map((d) => (
                <TableRow key={d.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="#2563EB">
                      {d.dispute_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      #{d.order?.order_number || d.order_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#334155">
                      {d.reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300 }} noWrap>
                      {d.details}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell sx={{ color: '#475569' }}>{formatDate(d.created_at)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#16A34A' }}>
                    {d.order ? formatCurrency(d.order.total_paise, true) : 'Escrow Hold'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* File Dispute Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>
          ⚠️ File Escrow Quality or Weight Dispute
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Platform arbitration officers will review this claim. Payout to the farmer is immediately suspended.
          </Typography>

          <TextField
            select
            label="Select Order *"
            fullWidth
            size="small"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            sx={{ mb: 2 }}
          >
            {orders.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                Order #{o.order_number} ({formatCurrency(o.total_paise, true)}) - {o.status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Dispute Reason *"
            fullWidth
            size="small"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Quality grade below specification">Quality grade below specification</MenuItem>
            <MenuItem value="Moisture percentage exceeded threshold">Moisture percentage exceeded threshold</MenuItem>
            <MenuItem value="Weight shortage at unloading scale">Weight shortage at unloading scale</MenuItem>
            <MenuItem value="Spoiled or damaged produce during transit">Spoiled or damaged produce during transit</MenuItem>
            <MenuItem value="Incorrect crop variety delivered">Incorrect crop variety delivered</MenuItem>
            <MenuItem value="Other specification breach">Other specification breach</MenuItem>
          </TextField>

          <TextField
            label="Detailed Evidence & Description *"
            fullWidth
            multiline
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the discrepancy with measurements, weighbridge slip numbers, or moisture meter readings..."
            sx={{ mb: 2 }}
          />

          <TextField
            label="Photo / Lab Report Proof Link (Optional)"
            fullWidth
            size="small"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://... photo of unloaded goods or test slip"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleFileDispute}
            disabled={raiseDisputeMutation.isPending}
          >
            {raiseDisputeMutation.isPending ? 'Filing Claim...' : 'Submit Dispute Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerDisputes;
