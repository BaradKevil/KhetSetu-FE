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
  Avatar,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdVerified,
  MdEco,
  MdAgriculture,
} from 'react-icons/md';
import { useGetAdminListingsQuery, useModerateListingMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const BACKEND_URL = (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const AdminListings = () => {
  const { formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Moderation Dialog
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [moderationAction, setModerationAction] = useState(''); // 'active' | 'inactive' | 'flagged'
  const [moderationReason, setModerationReason] = useState('');

  const { data: listingsData, isLoading, refetch } = useGetAdminListingsQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 50,
  });

  const moderateListingMutation = useModerateListingMutation();

  const products = Array.isArray(listingsData) ? listingsData : listingsData?.data || [];

  const handleExecuteModeration = async () => {
    if (!selectedProduct || !moderationAction) return;
    if (moderationAction !== 'active' && !moderationReason.trim()) {
      toast.error('A mandatory justification is required when pausing or removing a crop listing.');
      return;
    }

    try {
      await moderateListingMutation.mutateAsync({
        id: selectedProduct.id,
        status: moderationAction,
        reason: moderationReason || 'Listing approved by marketplace administrator.',
      });
      toast.success(`Listing #${selectedProduct.id} status updated to ${moderationAction}.`);
      setSelectedProduct(null);
      setModerationAction('');
      setModerationReason('');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to moderate listing.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            Crop Listings Moderation & Quality Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ensure fair pricing, organic certification validity, and authentic agricultural harvests on KhetSetu.
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} sx={{ bgcolor: '#F1F5F9' }}>
          <MdRefresh />
        </IconButton>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by crop name, category, or farmer..."
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
                { label: 'All Listings', val: 'all' },
                { label: 'Active', val: 'active' },
                { label: 'Draft / Pending', val: 'draft' },
                { label: 'Paused / Flagged', val: 'inactive' },
              ].map((tab) => (
                <Chip
                  key={tab.val}
                  label={tab.label}
                  clickable
                  color={statusFilter === tab.val ? 'primary' : 'default'}
                  variant={statusFilter === tab.val ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter(tab.val)}
                  sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Listings Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>CROP HARVEST</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>FARMER & LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>PRICE & UNIT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STOCK AVAILABLE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>QUALITY & HARVEST</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No crop listings found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const photos = p.photos || (p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : []);
                  const firstPhoto = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;

                  return (
                    <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={firstPhoto ? getImageUrl(firstPhoto) : undefined}
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800 }}
                          >
                            <MdAgriculture size={22} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800} color="#0F172A">
                              {p.crop_name || p.title || 'Agri Commodity'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{p.id} • {p.category || 'General Crop'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {p.seller?.full_name || p.seller?.farm_name || 'Farmer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.location || `${p.seller?.village || ''}, ${p.seller?.district || ''}`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#166534">
                          {formatINR(p.price_per_unit || p.price)} / {p.unit || 'kg'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Min: {p.minimum_order_quantity || 1} {p.unit || 'kg'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {p.quantity || 0} {p.unit || 'kg'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {p.is_organic || p.harvest_type === 'Certified Organic Harvest' ? (
                          <Chip
                            icon={<MdEco size={16} />}
                            label="ORGANIC"
                            size="small"
                            sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Chip label="CONVENTIONAL" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={p.status?.toUpperCase() || 'ACTIVE'}
                          size="small"
                          color={p.status === 'active' ? 'success' : p.status === 'inactive' ? 'error' : 'warning'}
                          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MdVisibility />}
                          onClick={() => {
                            setSelectedProduct(p);
                            setModerationAction('');
                            setModerationReason('');
                          }}
                          sx={{ fontWeight: 700 }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
              Moderation Inspection: {selectedProduct.crop_name || selectedProduct.title} (#{selectedProduct.id})
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Listing Specifications
                  </Typography>
                  <Typography variant="body2"><strong>Crop:</strong> {selectedProduct.crop_name || selectedProduct.title}</Typography>
                  <Typography variant="body2"><strong>Category:</strong> {selectedProduct.category || 'Agri'}</Typography>
                  <Typography variant="body2"><strong>Listed Price:</strong> {formatINR(selectedProduct.price_per_unit || selectedProduct.price)} / {selectedProduct.unit || 'kg'}</Typography>
                  <Typography variant="body2"><strong>Available Batch:</strong> {selectedProduct.quantity} {selectedProduct.unit || 'kg'}</Typography>
                  <Typography variant="body2"><strong>Min Order Qty:</strong> {selectedProduct.minimum_order_quantity || 1} {selectedProduct.unit || 'kg'}</Typography>
                  <Typography variant="body2"><strong>Packaging:</strong> {selectedProduct.packaging_type || 'Standard Gunny Bags'}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Description:</strong> {selectedProduct.description || 'No additional description provided.'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                    Farmer & Location Integrity
                  </Typography>
                  <Typography variant="body2"><strong>Farmer:</strong> {selectedProduct.seller?.full_name || selectedProduct.seller?.farm_name || 'Farmer'}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedProduct.seller?.phone || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {selectedProduct.location || 'Farm Direct'}</Typography>
                  <Typography variant="body2"><strong>Address Type:</strong> {selectedProduct.address_type || 'Farm Gate'}</Typography>

                  {selectedProduct.organic_certification_url && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
                      <Typography variant="caption" color="#166534" fontWeight={700} display="block">
                        🌾 Attached Organic Certification Document:
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => window.open(getImageUrl(selectedProduct.organic_certification_url), '_blank')}
                        sx={{ mt: 0.5, fontWeight: 700 }}
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
                    variant={moderationAction === 'active' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<MdCheckCircle />}
                    onClick={() => setModerationAction('active')}
                    sx={{ fontWeight: 700 }}
                  >
                    Approve / Activate Listing
                  </Button>
                  <Button
                    variant={moderationAction === 'inactive' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<MdCancel />}
                    onClick={() => setModerationAction('inactive')}
                    sx={{ fontWeight: 700 }}
                  >
                    Pause / Flag Listing
                  </Button>
                </Box>

                {moderationAction && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={moderationAction === 'active' ? 'Approval Notes (Optional)' : 'Mandatory Flagging Reason'}
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    required={moderationAction !== 'active'}
                  />
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedProduct(null)} sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              {moderationAction && (
                <Button
                  variant="contained"
                  color={moderationAction === 'active' ? 'success' : 'error'}
                  onClick={handleExecuteModeration}
                  disabled={moderateListingMutation.isPending || (moderationAction !== 'active' && !moderationReason.trim())}
                  sx={{ fontWeight: 700, px: 3 }}
                >
                  {moderateListingMutation.isPending ? 'Saving...' : 'Apply Moderation'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminListings;
