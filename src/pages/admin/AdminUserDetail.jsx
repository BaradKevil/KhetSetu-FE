import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  MdArrowBack,
  MdBlock,
  MdCheckCircle,
  MdAgriculture,
  MdBusinessCenter,
  MdAccountBalance,
  MdVerifiedUser,
  MdLandscape,
  MdShoppingBag,
} from 'react-icons/md';
import { useGetAdminUserDetailsQuery, useUpdateUserStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatDate } = useLanguage();

  const { data: user, isLoading, refetch } = useGetAdminUserDetailsQuery(id);
  const updateStatusMutation = useUpdateUserStatusMutation();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [reason, setReason] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          User #{id} not found.
        </Typography>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/admin/users')} sx={{ mt: 2 }}>
          Back to Directory
        </Button>
      </Box>
    );
  }

  const isSuspended = user.status === 'suspended';
  const seller = user.seller_profile;
  const buyer = user.buyer_profile;

  const handleExecuteStatusUpdate = async () => {
    if (!targetStatus) return;
    if (targetStatus === 'suspended' && !reason.trim()) {
      toast.error('A mandatory justification is required to suspend a user account.');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: Number(id),
        status: targetStatus,
        reason: reason || 'Updated by administrator.',
      });
      toast.success(`User status updated to ${targetStatus}.`);
      setStatusModalOpen(false);
      setReason('');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Back button & Action Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<MdArrowBack />}
          onClick={() => navigate('/admin/users')}
          sx={{ fontWeight: 700, color: '#475569' }}
        >
          Back to Users Directory
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isSuspended ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<MdCheckCircle />}
              onClick={() => {
                setTargetStatus('active');
                setStatusModalOpen(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Reactivate Account
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              startIcon={<MdBlock />}
              onClick={() => {
                setTargetStatus('suspended');
                setStatusModalOpen(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Suspend Account
            </Button>
          )}
        </Box>
      </Box>

      {/* 360 Profile Banner */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: '#2E7D32', width: 64, height: 64, fontSize: '1.75rem', fontWeight: 800 }}>
            {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                {user.full_name || user.name || 'Registered User'}
              </Typography>
              <Chip
                label={user.role?.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: user.role === 'seller' ? '#E8F5E9' : user.role === 'buyer' ? '#E0F2FE' : '#F1F5F9',
                  color: user.role === 'seller' ? '#166534' : user.role === 'buyer' ? '#0369A1' : '#0F172A',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              />
              <Chip
                label={user.status?.toUpperCase() || 'ACTIVE'}
                size="small"
                color={user.status === 'suspended' ? 'error' : 'success'}
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              User ID: #{user.id} • Registered Phone: {user.phone || 'N/A'} • Email: {user.email || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Account Created: {formatDate(user.createdAt || user.created_at, true)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Farmer Specific Profile Details */}
      {user.role === 'seller' && seller && (
        <Grid container spacing={3} sx={{ mb: 3.5 }}>
          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MdLandscape size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Agricultural Land & Farm Info
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Farm Name</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.farm_name || 'Individual Farm'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Land Size</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.land_size_acres ? `${seller.land_size_acres} Acres` : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.village}, {seller.district}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">State & Pin</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.state} - {seller.pincode}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<MdVerifiedUser />}
                  onClick={() => navigate(`/admin/kyc/${seller.id}`)}
                  sx={{ fontWeight: 700 }}
                >
                  Review Full Farmer KYC Documents
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MdAccountBalance size={22} color="#2563EB" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Bank Account & Payout Vault
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Holder</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.bank_account_holder || seller.full_name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.bank_name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.bank_account_number || seller.masked_account || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body2" fontWeight={600}>{seller.bank_ifsc || 'N/A'}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2.5 }}>
                <Chip
                  label={`KYC Status: ${seller.kyc_status?.toUpperCase() || 'UNVERIFIED'}`}
                  color={seller.kyc_status === 'verified' ? 'success' : 'warning'}
                  sx={{ fontWeight: 800 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Buyer Specific Profile Details */}
      {user.role === 'buyer' && (
        <Grid container spacing={3} sx={{ mb: 3.5 }}>
          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MdBusinessCenter size={22} color="#0284C7" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Buyer Business & Procurement Entity
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Trading Entity Name</Typography>
                  <Typography variant="body2" fontWeight={600}>{buyer?.company_name || user.full_name || 'Independent Wholesale Trader'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">GSTIN Number</Typography>
                  <Typography variant="body2" fontWeight={600}>{buyer?.gstin || 'Unregistered Agri Trader'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Registered Business Address</Typography>
                  <Typography variant="body2" fontWeight={600}>{buyer?.address || 'On file'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">State</Typography>
                  <Typography variant="body2" fontWeight={600}>{buyer?.state || 'India'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MdShoppingBag size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Escrow Procurement History
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                To inspect live contracts placed by this buyer, use the Orders Oversight module with filter: <code>{user.phone || user.id}</code>.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<MdShoppingBag />}
                onClick={() => navigate('/admin/orders')}
                sx={{ mt: 3, fontWeight: 700 }}
              >
                Inspect Buyer Orders
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Status Modal */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {targetStatus === 'suspended' ? '⚠️ Suspend User Account' : 'Reactivate User Account'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Confirm account state transition to <strong>{targetStatus.toUpperCase()}</strong> for {user.full_name || user.name}.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mandatory Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={targetStatus === 'suspended' ? 'error' : 'success'}
            onClick={handleExecuteStatusUpdate}
            disabled={updateStatusMutation.isPending || (targetStatus === 'suspended' && !reason.trim())}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserDetail;
