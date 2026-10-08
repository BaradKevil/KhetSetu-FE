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
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation, usePermanentlyDeleteUserMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const getRoleChip = (role) => {
  switch (role) {
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
      {/* Page Title */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} color="#0F172A">
          Users Directory & Access Governance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage authenticated farmers, wholesale buyers, and administrative staff across the KhetSetu network.
        </Typography>
      </Box>

      {/* Top Controls: Search Bar + Filter Dropdown + Export Button */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left: Search Bar & Status Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: { xs: '100%', sm: 320 } }}>
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
            sx={{ maxWidth: 420 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Account Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Account Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <MdFilterList size={18} color="#64748B" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Right: Export Button */}
        <Button
          variant="contained"
          startIcon={<MdFileDownload size={18} />}
          onClick={exportUsersCSV}
          sx={{
            fontWeight: 700,
            bgcolor: '#166534',
            '&:hover': { bgcolor: '#14532D' },
            borderRadius: 2,
            px: 2.5,
            py: 0.9,
            textTransform: 'none',
          }}
        >
          Export Directory
        </Button>
      </Paper>

      {/* 3 Tabs: Farmers | Buyers | Super Admin */}
      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              minHeight: 48,
              px: 3,
            },
          }}
        >
          <Tab
            value="seller"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdAgriculture size={19} />
                <span>Farmers</span>
                {counts.farmers !== undefined && (
                  <Chip
                    label={counts.farmers}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'seller' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'seller' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="buyer"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdBusinessCenter size={19} />
                <span>Buyers</span>
                {counts.buyers !== undefined && (
                  <Chip
                    label={counts.buyers}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'buyer' ? '#E0F2FE' : '#F1F5F9',
                      color: activeTab === 'buyer' ? '#0369A1' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="super_admin"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdAdminPanelSettings size={19} />
                <span>Super Admin</span>
                {counts.admins !== undefined && (
                  <Chip
                    label={counts.admins}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'super_admin' ? '#F1F5F9' : '#F8FAFC',
                      color: '#0F172A',
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Users Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    USER / ID
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
                    <CircularProgress size={32} sx={{ color: '#166534' }} />
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
                    'Location not set';

                  return (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* User & ID */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor:
                                user.role === 'seller'
                                  ? '#166534'
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

                      {/* Contact & Location */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#0F172A">
                          {user.phone || 'No phone'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.email || 'No email registered'}
                        </Typography>
                        <Typography variant="caption" color="#64748B" sx={{ fontSize: '0.68rem' }}>
                          📍 {locationText}
                        </Typography>
                      </TableCell>

                      {/* KYC Status */}
                      <TableCell>
                        {user.role === 'seller' ? (
                          <Chip
                            label={kycStatus?.toUpperCase() || 'UNVERIFIED'}
                            size="small"
                            color={
                              kycStatus === 'verified'
                                ? 'success'
                                : kycStatus === 'rejected'
                                ? 'error'
                                : kycStatus === 'pending'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not Applicable
                          </Typography>
                        )}
                      </TableCell>

                      {/* Account State */}
                      <TableCell>{getStatusChip(user.status || 'active')}</TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {formatDate(user.created_at || user.createdAt, false)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MdVisibility />}
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
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
                              sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
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
                              sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
                            >
                              Suspend
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<MdDeleteOutline />}
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteConfirmationText('');
                              setDeleteReason('');
                            }}
                            sx={{
                              fontWeight: 700,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              color: '#DC2626',
                              borderColor: '#FECACA',
                              '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' },
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
                  • Target: <strong>{userToDelete.full_name || userToDelete.name || userToDelete.phone}</strong> (ID: #{userToDelete.id}, Role: {userToDelete.role?.toUpperCase()})
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
