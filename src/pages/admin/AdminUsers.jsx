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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  TablePagination,
  TableSortLabel,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdBlock,
  MdCheckCircle,
  MdFileDownload,
  MdAgriculture,
  MdBusinessCenter,
  MdAdminPanelSettings,
  MdFilterList,
  MdDeleteOutline,
  MdWarning,
  MdPeople,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation, usePermanentlyDeleteUserMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const getRoleCode = (role) => {
  if (!role) return 'user';
  if (typeof role === 'string') return role.toLowerCase();
  return (role.code || role.name || 'user').toLowerCase();
};

const getRoleDisplay = (role) => {
  if (!role) return 'USER';
  if (typeof role === 'string') return role.toUpperCase();
  return String(role.name || role.code || 'USER').toUpperCase();
};

const getRoleChip = (role) => {
  const code = getRoleCode(role);
  switch (code) {
    case 'seller':
      return (
        <Chip
          icon={<MdAgriculture size={16} />}
          label="FARMER"
          size="small"
          sx={{ bgcolor: '#E8F5E9', color: '#166534', fontWeight: 800, fontSize: '0.72rem' }}
        />
      );
    case 'buyer':
      return (
        <Chip
          icon={<MdBusinessCenter size={16} />}
          label="BUYER"
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
      return <Chip label={getRoleDisplay(role)} size="small" />;
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
      return (
        <Chip
          label="INACTIVE"
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#64748B' }}
        />
      );
  }
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { formatDate } = useLanguage();

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('seller'); // 'seller' (Farmers) | 'buyer' (Buyers) | 'super_admin' (Admins)

  // Sorting & Pagination States (handled by backend)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Status Action Modal State
  const [actionUser, setActionUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  // Permanent Delete Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch users from backend with full server-side parameters
  const { data: usersData, isLoading } = useGetAdminUsersQuery({
    search: searchTerm.trim() || undefined,
    role: activeTab,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy,
    sortOrder,
    page,
    limit: rowsPerPage,
  });

  const updateStatusMutation = useUpdateUserStatusMutation();
  const deleteUserMutation = usePermanentlyDeleteUserMutation();

  // Safely extract users, pagination, and role counts from unwrapped backend response
  const users = usersData?.items || usersData?.data || (Array.isArray(usersData) ? usersData : []);
  const pagination = usersData?.pagination || {
    currentPage: page,
    totalPages: Math.ceil(users.length / rowsPerPage) || 1,
    totalCount: users.length,
    limit: rowsPerPage,
  };
  const counts = usersData?.counts || {};

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'ASC';
    setSortOrder(isAsc ? 'DESC' : 'ASC');
    setSortBy(property);
    setPage(1);
  };

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
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleExecutePermanentDeleteUser = async () => {
    if (!userToDelete) return;
    if (deleteConfirmationText.trim() !== 'DELETE') {
      toast.error('Please type DELETE to confirm permanent purge.');
      return;
    }

    try {
      const res = await deleteUserMutation.mutateAsync({
        id: userToDelete.id,
        reason: deleteReason.trim() || 'Permanently deleted by Super Admin from users directory',
      });
      toast.success(res?.message || `User #${userToDelete.id} and all related products permanently deleted.`);
      setUserToDelete(null);
      setDeleteConfirmationText('');
      setDeleteReason('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete user permanently.');
    }
  };

  const exportUsersCSV = () => {
    if (!users.length) {
      toast.info('No users available to export.');
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
      u.kyc_status || 'N/A',
      new Date(u.created_at || u.createdAt || Date.now()).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_${activeTab}_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header (Reference Screenshot 2 style) */}
      <PageHeader
        title="Users Directory & Access Governance"
        subtitle="Add, edit, and manage authenticated farmers, wholesale buyers, and administrative staff."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdFileDownload size={18} />}
            onClick={exportUsersCSV}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 1,
            }}
          >
            Export Directory
          </Button>
        }
      />

      {/* 3 KPI Stat Cards (Uniform full-width grid) */}
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
          icon={<MdPeople size={24} />}
          label="Total Users"
          value={pagination.totalCount || users.length}
          color="blue"
        />
        <KPICard
          icon={<MdCheckCircle size={24} />}
          label="Active Accounts"
          value={counts.active ?? users.filter(u => u.status === 'active').length}
          color="purple"
        />
        <KPICard
          icon={<MdWarning size={24} />}
          label="Suspended / Inactive"
          value={counts.suspended ?? users.filter(u => u.status === 'suspended').length}
          color="amber"
        />
      </Box>

      {/* Top Controls: Search Bar + Filter Dropdown (Reference Screenshot 2) */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 320 } }}>
          <Typography variant="body2" fontWeight={700} color="#334155" sx={{ mb: 0.8 }}>
            Search Users
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, phone, email or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} color="#64748B" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <Typography variant="body2" fontWeight={700} color="#334155" sx={{ mb: 0.8 }}>
            Filter Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 2,
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Main Table Card (Reference Screenshot 2: White card with Students List header) */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        {/* Card Header with Title and Role Tabs */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={800} color="#0F172A">
            Users List
          </Typography>

          {/* Segmented Pill Tabs */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              onClick={() => { setActiveTab('seller'); setPage(1); }}
              startIcon={<MdAgriculture size={17} />}
              sx={{
                borderRadius: 2,
                px: 1.8,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                bgcolor: activeTab === 'seller' ? '#EEF4FF' : '#F8FAFC',
                color: activeTab === 'seller' ? '#2563EB' : '#64748B',
                border: activeTab === 'seller' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                '&:hover': { bgcolor: activeTab === 'seller' ? '#E0EDFF' : '#F1F5F9' },
              }}
            >
              Farmers {counts.farmers !== undefined && `(${counts.farmers})`}
            </Button>

            <Button
              size="small"
              onClick={() => { setActiveTab('buyer'); setPage(1); }}
              startIcon={<MdBusinessCenter size={17} />}
              sx={{
                borderRadius: 2,
                px: 1.8,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                bgcolor: activeTab === 'buyer' ? '#EEF4FF' : '#F8FAFC',
                color: activeTab === 'buyer' ? '#2563EB' : '#64748B',
                border: activeTab === 'buyer' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                '&:hover': { bgcolor: activeTab === 'buyer' ? '#E0EDFF' : '#F1F5F9' },
              }}
            >
              Buyers {counts.buyers !== undefined && `(${counts.buyers})`}
            </Button>

            <Button
              size="small"
              onClick={() => { setActiveTab('super_admin'); setPage(1); }}
              startIcon={<MdAdminPanelSettings size={17} />}
              sx={{
                borderRadius: 2,
                px: 1.8,
                py: 0.6,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                bgcolor: activeTab === 'super_admin' ? '#EEF4FF' : '#F8FAFC',
                color: activeTab === 'super_admin' ? '#2563EB' : '#64748B',
                border: activeTab === 'super_admin' ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                '&:hover': { bgcolor: activeTab === 'super_admin' ? '#E0EDFF' : '#F1F5F9' },
              }}
            >
              Super Admin {counts.admins !== undefined && `(${counts.admins})`}
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    USER INFO
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  ROLE
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'phone'}
                    direction={sortBy === 'phone' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('phone')}
                  >
                    CONTACT & LOCATION
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  KYC STATUS
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    ACCOUNT STATE
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'created_at'}
                    direction={sortBy === 'created_at' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('created_at')}
                  >
                    JOINED DATE
                  </TableSortLabel>
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
                      Loading authenticated network directory from cloud database...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" fontWeight={700} color="#334155" sx={{ mb: 0.5 }}>
                      No {activeTab === 'seller' ? 'Farmers' : activeTab === 'buyer' ? 'Buyers' : 'Admins'} Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No registered records matching your current search or status filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const kycStatus = user.kyc_status || user.seller_profile?.kyc_status;
                  const isSuspended = user.status === 'suspended';
                  const locationText =
                    [user.district, user.state].filter(Boolean).join(', ') ||
                    [user.seller_profile?.district, user.seller_profile?.state].filter(Boolean).join(', ') ||
                    '';

                  return (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* User & ID */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor:
                                user.role === 'seller'
                                  ? '#2563EB'
                                  : user.role === 'buyer'
                                  ? '#0284C7'
                                  : '#0F172A',
                              width: 36,
                              height: 36,
                              fontSize: '0.85rem',
                              fontWeight: 800,
                            }}
                          >
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {user.full_name || 'Registered User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              ID: #{user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>{getRoleChip(user.role)}</TableCell>

                      {/* Contact & Location (Clean vertical rhythm without overlapping text) */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#0F172A">
                          {user.phone ? (String(user.phone).startsWith('+') ? user.phone : `+${user.phone}`) : 'No phone'}
                        </Typography>
                        {user.email ? (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {user.email}
                          </Typography>
                        ) : null}
                        {locationText ? (
                          <Typography variant="caption" color="#64748B" display="block" sx={{ fontSize: '0.72rem', mt: 0.2 }}>
                            📍 {locationText}
                          </Typography>
                        ) : null}
                      </TableCell>

                      {/* KYC Status */}
                      <TableCell>
                        {user.role === 'seller' ? (
                          <StatusBadge status={kycStatus || 'unverified'} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not Applicable
                          </Typography>
                        )}
                      </TableCell>

                      {/* Account State */}
                      <TableCell>
                        <StatusBadge status={user.status || 'active'} />
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {formatDate(user.created_at || user.createdAt, false)}
                        </Typography>
                      </TableCell>

                      {/* Actions (Exact match with Reference Screenshot 2 text action links) */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                          <Button
                            size="small"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            sx={{
                              fontWeight: 700,
                              color: '#2563EB',
                              textTransform: 'none',
                              px: 1,
                              minWidth: 'auto',
                              '&:hover': { bgcolor: '#EFF6FF' },
                            }}
                          >
                            Profile
                          </Button>

                          {isSuspended ? (
                            <Button
                              size="small"
                              onClick={() => {
                                setActionUser(user);
                                setTargetStatus('active');
                                setStatusReason('Re-activated by administrative review.');
                              }}
                              sx={{
                                fontWeight: 700,
                                color: '#16A34A',
                                textTransform: 'none',
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#F0FDF4' },
                              }}
                            >
                              Reactivate
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => {
                                setActionUser(user);
                                setTargetStatus('suspended');
                                setStatusReason('');
                              }}
                              sx={{
                                fontWeight: 700,
                                color: '#DC2626',
                                textTransform: 'none',
                                px: 1,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#FEF2F2' },
                              }}
                            >
                              Suspend
                            </Button>
                          )}

                          <Button
                            size="small"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteConfirmationText('');
                              setDeleteReason('');
                            }}
                            sx={{
                              fontWeight: 700,
                              color: '#94A3B8',
                              textTransform: 'none',
                              px: 0.8,
                              minWidth: 'auto',
                              '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Server-Side Pagination */}
        <TablePagination
          component="div"
          count={pagination.totalCount || users.length}
          page={page - 1}
          onPageChange={(_e, newPage) => setPage(newPage + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: '1px solid #E2E8F0' }}
        />
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
                {targetStatus === 'suspended' &&
                  ' Suspended users are instantly blocked from placing orders, withdrawing payouts, or modifying listings.'}
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
              <Button onClick={() => setActionUser(null)} sx={{ fontWeight: 700, textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color={targetStatus === 'suspended' ? 'error' : 'success'}
                onClick={handleExecuteStatusUpdate}
                disabled={updateStatusMutation.isPending || (targetStatus === 'suspended' && !statusReason.trim())}
                sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}
              >
                {updateStatusMutation.isPending ? 'Updating...' : `Confirm ${targetStatus.toUpperCase()}`}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Permanent Delete User Modal */}
      <Dialog
        open={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {userToDelete && (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdWarning size={24} color="#DC2626" /> Permanently Delete User From Database
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ p: 2, mb: 2.5, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={700} color="#991B1B" sx={{ mb: 1 }}>
                  ⚠️ CRITICAL WARNING: Permanent Purge from TiDB Database
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • Target: <strong>{userToDelete.full_name || userToDelete.name || userToDelete.phone}</strong> (ID: #{userToDelete.id}, Role: {getRoleDisplay(userToDelete.role)})
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • <strong>All crops & products listed by this user will be automatically and permanently deleted from the database.</strong>
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • Associated profiles, KYC records, authentication tokens, and related orders will be purged.
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block">
                  • <strong>This action CANNOT be undone.</strong>
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#334155' }}>
                To confirm permanent deletion, type <strong>DELETE</strong> below:
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Type DELETE"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                size="small"
                label="Reason for Deletion (Optional)"
                placeholder="e.g. User requested deletion, test data cleanup, etc."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setUserToDelete(null)}
                sx={{ fontWeight: 700, textTransform: 'none', color: '#64748B' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleExecutePermanentDeleteUser}
                disabled={deleteConfirmationText.trim() !== 'DELETE' || deleteUserMutation.isPending}
                sx={{ fontWeight: 700, px: 3, textTransform: 'none', bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
              >
                {deleteUserMutation.isPending ? 'Purging from Database...' : 'Permanently Delete User & Products'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
