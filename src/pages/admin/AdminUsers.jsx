import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Avatar,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdBlock,
  MdCheckCircle,
  MdRefresh,
  MdFileDownload,
  MdPerson,
  MdAgriculture,
  MdBusinessCenter,
  MdAdminPanelSettings,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const getRoleChip = (role) => {
  switch (role) {
    case 'seller':
      return (
        <Chip
          icon={<MdAgriculture size={16} />}
          label="FARMER (SELLER)"
          size="small"
          sx={{ bgcolor: '#E8F5E9', color: '#166534', fontWeight: 800, fontSize: '0.72rem' }}
        />
      );
    case 'buyer':
      return (
        <Chip
          icon={<MdBusinessCenter size={16} />}
          label="TRADER (BUYER)"
          size="small"
          sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '0.72rem' }}
        />
      );
    case 'super_admin':
    case 'staff':
      return (
        <Chip
          icon={<MdAdminPanelSettings size={16} />}
          label="SUPER ADMIN"
          size="small"
          sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 800, fontSize: '0.72rem' }}
        />
      );
    default:
      return <Chip label={role?.toUpperCase() || 'USER'} size="small" />;
  }
};

const getStatusChip = (status) => {
  switch (status) {
    case 'active':
      return <Chip label="ACTIVE" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'suspended':
      return <Chip label="SUSPENDED" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'inactive':
    default:
      return <Chip label="INACTIVE" size="small" sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#64748B' }} />;
  }
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Status Action Modal
  const [actionUser, setActionUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const { data: usersData, isLoading, refetch } = useGetAdminUsersQuery({
    search: searchTerm || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    page,
    limit: 50,
  });

  const updateStatusMutation = useUpdateUserStatusMutation();

  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];

  const handleExecuteStatusUpdate = async () => {
    if (!actionUser || !targetStatus) return;
    if (targetStatus === 'suspended' && !statusReason.trim()) {
      toast.error('A mandatory justification is required to suspend a user account.');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: actionUser.id,
        status: targetStatus,
        reason: statusReason || 'Admin updated user operational status.',
      });
      toast.success(`User #${actionUser.id} status successfully changed to ${targetStatus}.`);
      setActionUser(null);
      setTargetStatus('');
      setStatusReason('');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    }
  };

  const exportUsersCSV = () => {
    if (!users.length) {
      toast.info('No users to export.');
      return;
    }
    const headers = ['User ID', 'Full Name', 'Role', 'Phone', 'Email', 'Status', 'KYC Status', 'Joined Date'];
    const rows = users.map((u) => [
      u.id,
      `"${u.full_name || u.name || 'User'}"`,
      u.role,
      `"${u.phone || ''}"`,
      `"${u.email || ''}"`,
      u.status || 'active',
      u.seller_profile?.kyc_status || 'N/A',
      new Date(u.createdAt || u.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            Users Directory & Access Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage authenticated farmers, wholesale buyers, and administrative staff across the KhetSetu network.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<MdFileDownload />}
            onClick={exportUsersCSV}
            sx={{ fontWeight: 700 }}
          >
            Export Directory
          </Button>
          <IconButton onClick={() => refetch()} sx={{ bgcolor: '#F1F5F9' }}>
            <MdRefresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, phone, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch color="#94A3B8" size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              {[
                { label: 'All Users', val: 'all' },
                { label: 'Farmers', val: 'seller' },
                { label: 'Buyers', val: 'buyer' },
                { label: 'Admins', val: 'super_admin' },
              ].map((tab) => (
                <Chip
                  key={tab.val}
                  label={tab.label}
                  clickable
                  color={roleFilter === tab.val ? 'primary' : 'default'}
                  variant={roleFilter === tab.val ? 'filled' : 'outlined'}
                  onClick={() => setRoleFilter(tab.val)}
                  sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>USER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ROLE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>CONTACT INFO</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>KYC STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ACCOUNT STATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>JOINED DATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2E7D32' }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No registered users found matching this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const kycStatus = user.seller_profile?.kyc_status;
                  const isSuspended = user.status === 'suspended';

                  return (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#2E7D32', width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700 }}>
                            {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {user.full_name || user.name || 'Registered User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: #{user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {getRoleChip(user.role)}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#0F172A">
                          {user.phone || 'No phone'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.email || 'No email registered'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {user.role === 'seller' ? (
                          <Chip
                            label={kycStatus?.toUpperCase() || 'UNVERIFIED'}
                            size="small"
                            color={kycStatus === 'verified' ? 'success' : kycStatus === 'rejected' ? 'error' : kycStatus === 'pending' ? 'warning' : 'default'}
                            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not Applicable
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {getStatusChip(user.status || 'active')}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {formatDate(user.createdAt || user.created_at, false)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MdVisibility />}
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            sx={{ fontWeight: 700 }}
                          >
                            Profile
                          </Button>

                          {isSuspended ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<MdCheckCircle />}
                              onClick={() => {
                                setActionUser(user);
                                setTargetStatus('active');
                                setStatusReason('Re-activated by administrative review.');
                              }}
                              sx={{ fontWeight: 700 }}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<MdBlock />}
                              onClick={() => {
                                setActionUser(user);
                                setTargetStatus('suspended');
                                setStatusReason('');
                              }}
                              sx={{ fontWeight: 700 }}
                            >
                              Suspend
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* User Status Change Confirmation Modal */}
      <Dialog
        open={Boolean(actionUser)}
        onClose={() => setActionUser(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        {actionUser && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {targetStatus === 'suspended' ? '⚠️ Suspend User Account' : 'Reactivate User Account'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You are about to change the account status for <strong>{actionUser.full_name || actionUser.name}</strong> (#{actionUser.id}) to <strong>{targetStatus.toUpperCase()}</strong>.
                {targetStatus === 'suspended' && ' Suspended users are instantly blocked from placing orders, withdrawing payouts, or modifying listings.'}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mandatory Reason / Notes"
                placeholder="Specify the reason for this account action (fraud, KYC violation, manual request, etc.)..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                required
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setActionUser(null)} sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color={targetStatus === 'suspended' ? 'error' : 'success'}
                onClick={handleExecuteStatusUpdate}
                disabled={updateStatusMutation.isPending || (targetStatus === 'suspended' && !statusReason.trim())}
                sx={{ fontWeight: 700, px: 3 }}
              >
                {updateStatusMutation.isPending ? 'Updating...' : `Confirm ${targetStatus.toUpperCase()}`}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
