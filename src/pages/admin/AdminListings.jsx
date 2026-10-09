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
  Grid,
  InputAdornment,
  TablePagination,
  TableSortLabel,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdAgriculture,
  MdFileDownload,
  MdFilterList,
  MdGrade,
  MdDeleteOutline,
  MdWarning,
} from 'react-icons/md';
import {
  useGetAdminListingsQuery,
  useModerateListingMutation,
  usePermanentlyDeleteListingMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { getFirstImage, getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const getStatusChip = (status) => {
  switch (status) {
    case 'live':
      return <Chip label="LIVE ON MANDI" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'sold_out':
      return <Chip label="SOLD OUT" size="small" sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#475569' }} />;
    case 'draft':
      return <Chip label="DRAFT / PENDING" size="small" color="warning" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    default:
      return <Chip label={status?.toUpperCase() || 'UNKNOWN'} size="small" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
  }
};

const AdminListings = () => {
  const { formatDate } = useLanguage();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'live' | 'draft' | 'sold_out'

  // Sorting & Pagination States (handled by backend)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Moderation Dialog State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [moderationAction, setModerationAction] = useState(''); // 'approve' | 'pause' | 'reject'
  const [moderationReason, setModerationReason] = useState('');

  // Permanent Delete Modal State
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch listings with full server-side parameters
  const effectiveStatus = activeTab !== 'all' ? activeTab : statusFilter !== 'all' ? statusFilter : undefined;

  const { data: listingsData, isLoading } = useGetAdminListingsQuery({
    search: searchTerm.trim() || undefined,
    status: effectiveStatus,
    sortBy,
    sortOrder,
    page,
    limit: rowsPerPage,
  });

  const moderateListingMutation = useModerateListingMutation();
  const deleteListingMutation = usePermanentlyDeleteListingMutation();

  // Safely extract products, pagination, and counts
  const products = listingsData?.items || listingsData?.data || (Array.isArray(listingsData) ? listingsData : []);
  const pagination = listingsData?.pagination || {
    currentPage: page,
    totalPages: Math.ceil(products.length / rowsPerPage) || 1,
    totalCount: products.length,
    limit: rowsPerPage,
  };
  const counts = listingsData?.counts || {};

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

  const handleExecuteModeration = async () => {
    if (!selectedProduct || !moderationAction) return;
    if (moderationAction !== 'approve' && !moderationReason.trim()) {
      toast.error('A mandatory justification is required when pausing or rejecting a crop listing.');
      return;
    }

    try {
      await moderateListingMutation.mutateAsync({
        id: selectedProduct.id,
        action: moderationAction,
        reason: moderationReason || 'Listing approved by marketplace administrator.',
      });
      toast.success(`Listing #${selectedProduct.id} moderation updated to '${moderationAction}'.`);
      setSelectedProduct(null);
      setModerationAction('');
      setModerationReason('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to moderate listing.');
    }
  };

  const handleExecutePermanentDeleteProduct = async () => {
    if (!productToDelete) return;
    if (deleteConfirmationText.trim() !== 'DELETE') {
      toast.error('Please type DELETE to confirm permanent purge.');
      return;
    }

    try {
      const res = await deleteListingMutation.mutateAsync({
        id: productToDelete.id,
        reason: deleteReason.trim() || 'Permanently deleted by Super Admin from crop listings page',
      });
      toast.success(res?.message || `Listing #${productToDelete.id} permanently deleted.`);
      if (selectedProduct?.id === productToDelete.id) {
        setSelectedProduct(null);
      }
      setProductToDelete(null);
      setDeleteConfirmationText('');
      setDeleteReason('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete listing permanently.');
    }
  };

  const exportListingsCSV = () => {
    if (!products.length) {
      toast.info('No listings available to export.');
      return;
    }
    const headers = ['Listing ID', 'Crop', 'Variety', 'Grade', 'Farmer', 'Location', 'Price (INR)', 'Unit', 'Available Qty', 'Status', 'Date'];
    const rows = products.map((p) => {
      const priceINR = (p.price_per_unit_paise ? p.price_per_unit_paise / 100 : p.price_per_unit || 0);
      return [
        p.id,
        `"${p.crop?.name || 'Crop'}"`,
        `"${p.variety || ''}"`,
        `"${p.grade || 'Grade A'}"`,
        `"${p.seller?.seller_profile?.full_name || 'Farmer'}"`,
        `"${p.pickup_district || ''}, ${p.pickup_state || ''}"`,
        priceINR,
        `"${p.unit || 'Kg'}"`,
        p.available_quantity || p.total_quantity || 0,
        p.status || 'draft',
        new Date(p.created_at || p.createdAt || Date.now()).toISOString(),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_crop_listings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header (Reference Design) */}
      <PageHeader
        title="Crop Listings Moderation & Quality Control"
        subtitle="Ensure fair pricing, organic certification validity, and authentic agricultural harvests on KhetSetu."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdFileDownload size={18} />}
            onClick={exportListingsCSV}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 1,
            }}
          >
            Export Listings CSV
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
          icon={<MdAgriculture size={24} />}
          label="Total Crop Listings"
          value={pagination.totalCount || products.length}
          color="blue"
        />
        <KPICard
          icon={<MdCheckCircle size={24} />}
          label="Live on Mandi"
          value={counts.live ?? products.filter(p => p.status === 'live').length}
          color="green"
        />
        <KPICard
          icon={<MdWarning size={24} />}
          label="Draft / Moderation Pending"
          value={counts.draft ?? products.filter(p => p.status === 'draft').length}
          color="amber"
        />
      </Box>

      {/* Top Controls: Search Bar + Filter Dropdown */}
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
            placeholder="Search by variety, grade, district or state..."
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
            <InputLabel id="listing-status-filter-label">Filter Status</InputLabel>
            <Select
              labelId="listing-status-filter-label"
              value={statusFilter}
              label="Filter Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActiveTab('all');
                setPage(1);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <MdFilterList size={18} color="#64748B" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="live">Live on Mandi</MenuItem>
              <MenuItem value="draft">Draft / Pending</MenuItem>
              <MenuItem value="sold_out">Sold Out</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabs: All Listings | Live on Mandi | Draft / Pending | Sold Out */}
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
            value="all"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>All Listings</span>
                {counts.all !== undefined && (
                  <Chip
                    label={counts.all}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'all' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'all' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="live"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Live on Mandi</span>
                {counts.live !== undefined && (
                  <Chip
                    label={counts.live}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'live' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'live' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="draft"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Draft / Pending</span>
                {counts.draft !== undefined && (
                  <Chip
                    label={counts.draft}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'draft' ? '#FEF3C7' : '#F1F5F9',
                      color: activeTab === 'draft' ? '#B45309' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="sold_out"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Sold Out</span>
                {counts.sold_out !== undefined && (
                  <Chip
                    label={counts.sold_out}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'sold_out' ? '#E2E8F0' : '#F1F5F9',
                      color: '#475569',
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Listings Table */}
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
                    CROP HARVEST / ID
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  FARMER & LOCATION
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'price_per_unit_paise'}
                    direction={sortBy === 'price_per_unit_paise' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('price_per_unit_paise')}
                  >
                    PRICE & UNIT
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'available_quantity'}
                    direction={sortBy === 'available_quantity' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('available_quantity')}
                  >
                    AVAILABLE STOCK
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  GRADE & ATTRIBUTES
                </TableCell>

                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', py: 1.8 }}>
                  <TableSortLabel
                    active={sortBy === 'status'}
                    direction={sortBy === 'status' ? sortOrder.toLowerCase() : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    STATUS
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
                      Loading crop listings from cloud database...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" fontWeight={700} color="#334155" sx={{ mb: 0.5 }}>
                      No Crop Listings Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No harvest records matching your current search or status filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const imageSrc = getFirstImage(p);
                  const priceINR = p.price_per_unit_paise ? p.price_per_unit_paise / 100 : p.price_per_unit || 0;
                  const farmerName =
                    p.seller?.seller_profile?.full_name || p.seller?.seller_profile?.farm_name || 'Farmer';
                  const locationText =
                    [p.pickup_village, p.pickup_district, p.pickup_state].filter(Boolean).join(', ') ||
                    'Farm Gate';

                  return (
                    <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Crop Harvest & ID */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={imageSrc}
                            variant="rounded"
                            imgProps={{
                              onError: (e) => {
                                e.target.onerror = null;
                                e.target.src = p.crop?.image_url || DEFAULT_FALLBACK_IMAGE;
                              },
                            }}
                            sx={{ width: 44, height: 44, bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800 }}
                          >
                            <MdAgriculture size={22} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {p.variety}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.crop?.name || 'Crop'} • #{p.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Farmer & Location */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {farmerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          📍 {locationText}
                        </Typography>
                        {p.seller?.phone && (
                          <Typography variant="caption" color="#64748B" sx={{ fontSize: '0.68rem' }}>
                            📞 {p.seller.phone}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Price & Unit */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#15803D">
                          {formatINR(priceINR)} / {p.unit || 'Kg'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {p.min_order_quantity || 1} {p.unit || 'Kg'}
                        </Typography>
                      </TableCell>

                      {/* Stock Available */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {Number(p.available_quantity || p.total_quantity || 0).toLocaleString('en-IN')} {p.unit || 'Kg'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total: {Number(p.total_quantity || 0).toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>

                      {/* Grade & Attributes */}
                      <TableCell>
                        <Chip
                          icon={<MdGrade size={14} />}
                          label={p.grade || 'Grade A'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#F1F5F9', color: '#334155', mb: 0.5 }}
                        />
                        {p.is_organic && (
                          <Chip
                            label="ORGANIC"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, fontSize: '0.65rem', ml: 0.5 }}
                          />
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusChip(p.status)}</TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MdVisibility />}
                            onClick={() => {
                              setSelectedProduct(p);
                              setModerationAction('');
                              setModerationReason('');
                            }}
                            sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
                          >
                            Review
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<MdDeleteOutline />}
                            onClick={() => {
                              setProductToDelete(p);
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
          count={pagination.totalCount || products.length}
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

      {/* Moderation Inspection Dialog */}
      <Dialog
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Moderation Inspection: {selectedProduct.variety} (#{selectedProduct.id})
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Listing Specifications
                  </Typography>
                  <Typography variant="body2">
                    <strong>Crop:</strong> {selectedProduct.crop?.name || 'Agri Commodity'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Variety:</strong> {selectedProduct.variety}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Grade:</strong> {selectedProduct.grade}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Listed Price:</strong>{' '}
                    {formatINR(
                      selectedProduct.price_per_unit_paise
                        ? selectedProduct.price_per_unit_paise / 100
                        : selectedProduct.price_per_unit || 0
                    )}{' '}
                    / {selectedProduct.unit || 'Kg'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Available Batch:</strong> {selectedProduct.available_quantity}{' '}
                    {selectedProduct.unit || 'Kg'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Min Order Qty:</strong> {selectedProduct.min_order_quantity || 1}{' '}
                    {selectedProduct.unit || 'Kg'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Packaging:</strong>{' '}
                    {selectedProduct.packaging_type || 'Standard Gunny Bags'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Farmer & Location Integrity
                  </Typography>
                  <Typography variant="body2">
                    <strong>Farmer:</strong>{' '}
                    {selectedProduct.seller?.seller_profile?.full_name || 'Farmer'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedProduct.seller?.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong>{' '}
                    {[
                      selectedProduct.pickup_village,
                      selectedProduct.pickup_district,
                      selectedProduct.pickup_state,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address Type:</strong>{' '}
                    {selectedProduct.pickup_address_type || 'Farm Gate'}
                  </Typography>

                  {selectedProduct.organic_certificate_url && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: '#F0FDF4',
                        borderRadius: 2,
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <Typography variant="caption" color="#166534" fontWeight={700} display="block">
                        🌾 Attached Organic Certification Document:
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() =>
                          window.open(getImageUrl(selectedProduct.organic_certificate_url), '_blank')
                        }
                        sx={{ mt: 0.5, fontWeight: 700, textTransform: 'none' }}
                      >
                        Inspect Certificate Document
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                  Moderator Action:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Button
                    variant={moderationAction === 'approve' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<MdCheckCircle />}
                    onClick={() => setModerationAction('approve')}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Approve / Make Live
                  </Button>
                  <Button
                    variant={moderationAction === 'pause' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setModerationAction('pause')}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Move to Draft / Pause
                  </Button>
                  <Button
                    variant={moderationAction === 'reject' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<MdCancel />}
                    onClick={() => setModerationAction('reject')}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Reject Listing
                  </Button>
                </Box>

                {moderationAction && moderationAction !== 'approve' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Mandatory Reason for Pausing/Rejecting"
                    placeholder="Specify reason for moderation action..."
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    required
                  />
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<MdDeleteOutline />}
                onClick={() => {
                  setProductToDelete(selectedProduct);
                  setDeleteConfirmationText('');
                  setDeleteReason('');
                }}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#FCA5A5',
                  color: '#DC2626',
                  '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' },
                }}
              >
                Permanently Delete
              </Button>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button onClick={() => setSelectedProduct(null)} sx={{ fontWeight: 700, textTransform: 'none' }}>
                  Cancel
                </Button>
                {moderationAction && (
                  <Button
                    variant="contained"
                    color={moderationAction === 'approve' ? 'success' : 'error'}
                    onClick={handleExecuteModeration}
                    disabled={
                      moderateListingMutation.isPending ||
                      (moderationAction !== 'approve' && !moderationReason.trim())
                    }
                    sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}
                  >
                    {moderateListingMutation.isPending ? 'Saving...' : 'Apply Moderation'}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Permanent Delete Product Modal */}
      <Dialog
        open={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {productToDelete && (
          <>
            <DialogTitle sx={{ fontWeight: 800, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdWarning size={24} color="#DC2626" /> Permanently Delete Crop Listing From Database
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ p: 2, mb: 2.5, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={700} color="#991B1B" sx={{ mb: 1 }}>
                  ⚠️ CRITICAL WARNING: Permanent Listing Purge from TiDB Database
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • Crop Listing: <strong>{productToDelete.crop?.name || 'Crop'} - {productToDelete.variety}</strong> (ID: #{productToDelete.id}, Grade: {productToDelete.grade})
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • Farmer / Seller: <strong>{productToDelete.seller?.seller_profile?.full_name || productToDelete.seller?.phone || 'Farmer'}</strong>
                </Typography>
                <Typography variant="caption" color="#B91C1C" display="block" sx={{ mb: 0.5 }}>
                  • This crop and all its marketplace batch records will be permanently removed from the database.
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
                placeholder="e.g. Invalid harvest batch, duplicate entry, farmer request, test data..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setProductToDelete(null)}
                sx={{ fontWeight: 700, textTransform: 'none', color: '#64748B' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleExecutePermanentDeleteProduct}
                disabled={deleteConfirmationText.trim() !== 'DELETE' || deleteListingMutation.isPending}
                sx={{
                  fontWeight: 700,
                  px: 3,
                  textTransform: 'none',
                  bgcolor: '#DC2626',
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                {deleteListingMutation.isPending ? 'Purging from Database...' : 'Permanently Delete Crop'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminListings;
