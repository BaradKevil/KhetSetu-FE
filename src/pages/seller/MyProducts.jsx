import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Menu,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import {
  MdAddCircleOutline,
  MdVisibility,
  MdStorefront,
  MdCheckCircle,
  MdInventory2,
  MdPauseCircleOutline,
  MdPlayCircleOutline,
  MdRefresh,
  MdMoreVert,
  MdHelpOutline,
  MdEdit,
} from 'react-icons/md';
import { useGetSellerProductsQuery, useGetProfileQuery, useUpdateProductMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { getFirstImage, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';
import { formatINR, formatQty, STOCK_ADJUSTMENT_REASONS } from '../../common/status';

const CropImageThumbnail = ({ product }) => {
  const cropUrl = product?.crop?.image_url;
  const primaryUrl = getFirstImage(product);
  const initial = primaryUrl && !primaryUrl.startsWith('blob:') ? primaryUrl : cropUrl || DEFAULT_FALLBACK_IMAGE;

  const [imgUrl, setImgUrl] = useState(initial);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const updated = getFirstImage(product);
    setImgUrl(updated && !updated.startsWith('blob:') ? updated : cropUrl || DEFAULT_FALLBACK_IMAGE);
    setLoadFailed(false);
  }, [product, cropUrl]);

  const handleImgError = () => {
    if (cropUrl && imgUrl !== cropUrl) {
      setImgUrl(cropUrl);
    } else if (imgUrl !== DEFAULT_FALLBACK_IMAGE) {
      setImgUrl(DEFAULT_FALLBACK_IMAGE);
    } else {
      setLoadFailed(true);
    }
  };

  return (
    <Box
      sx={{
        width: 48,
        height: 48,
        minWidth: 48,
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: '#F8FAFC',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {!loadFailed ? (
        <Box
          component="img"
          src={imgUrl}
          alt={product.variety || product.crop?.name || 'Crop'}
          onError={handleImgError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#166534',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          {product.variety?.[0] || '🌾'}
        </Box>
      )}
    </Box>
  );
};

const MyProducts = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const { data: userProfile } = useGetProfileQuery();
  const { data: productsData, isLoading } = useGetSellerProductsQuery();
  const updateProductMutation = useUpdateProductMutation();

  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';
  const products = productsData?.items || [];

  const [activeTab, setActiveTab] = useState('all');

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockPrice, setRestockPrice] = useState('');
  const [restockReason, setRestockReason] = useState('RESTOCK');

  // "Why isn't my listing live?" Explainer Dialog
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [explainerProduct, setExplainerProduct] = useState(null);

  const handleAddCropClick = () => {
    if (kycStatus !== 'verified') {
      toast.warning(t('farmer.completeKycFirst', 'Please complete Farm KYC first'));
      navigate('/seller/profile');
      return;
    }
    navigate('/seller/products/new');
  };

  // Filter products by tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'live') return p.status === 'live';
    if (activeTab === 'paused') return p.status === 'paused';
    if (activeTab === 'sold_out') return p.status === 'sold_out';
    if (activeTab === 'pending_approval') return p.status === 'pending_approval';
    if (activeTab === 'draft') return p.status === 'draft';
    return true;
  });

  // Toggle Pause/Resume
  const handleTogglePause = async (product) => {
    const newStatus = product.status === 'live' ? 'paused' : 'live';
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        status: newStatus,
      });
      toast.success(newStatus === 'live' ? 'Listing is now live on Mandi!' : 'Listing paused.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating listing status');
    }
  };

  // Open Restock Modal
  const handleOpenRestock = (product) => {
    setTargetProduct(product);
    setRestockQuantity('100');
    setRestockPrice(product.price_per_unit_paise ? String(product.price_per_unit_paise / 100) : '');
    setRestockModalOpen(true);
  };

  const handleConfirmRestock = async () => {
    if (!targetProduct) return;
    const addQty = Number(restockQuantity);
    if (!addQty || addQty <= 0) {
      toast.warning('Please enter valid restock quantity');
      return;
    }

    try {
      const newAvailable = Number(targetProduct.available_quantity || 0) + addQty;
      const payload = {
        id: targetProduct.id,
        available_quantity: newAvailable,
        status: 'live',
      };
      if (restockPrice && Number(restockPrice) > 0) {
        payload.price_per_unit = Number(restockPrice);
      }

      await updateProductMutation.mutateAsync(payload);
      toast.success(`Successfully restocked ${targetProduct.crop?.name}! Listing is now live.`);
      setRestockModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error restocking crop');
    }
  };

  const handleOpenExplainer = (product) => {
    setExplainerProduct(product);
    setExplainerOpen(true);
  };

  // Metric aggregates
  const totalCrops = products.length;
  const liveCrops = products.filter((p) => p.status === 'live').length;
  const soldOutCrops = products.filter((p) => p.status === 'sold_out').length;
  const totalStock = products.reduce((acc, p) => acc + (Number(p.available_quantity) || 0), 0);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={t('farmer.cropListingsTitle', '🌾 My Crop Listings & Inventory')}
        subtitle={t('farmer.cropListingsSubtitle', 'Manage your agricultural crop listings, restock batches, and control Mandi visibility.')}
        actions={
          <Button
            onClick={handleAddCropClick}
            variant="contained"
            color="primary"
            startIcon={<MdAddCircleOutline />}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, py: 1 }}
          >
            {t('farmer.addCropBtn', 'Add New Crop')}
          </Button>
        }
      />

      {/* 2. KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          label={t('farmer.kpiTotalCrops', 'Total Crops Listed')}
          value={totalCrops}
          subtitle="All agricultural listings"
          icon={<MdInventory2 />}
          color="blue"
          onClick={() => setActiveTab('all')}
        />
        <KPICard
          label={t('farmer.kpiLiveCrops', 'Live on Mandi')}
          value={liveCrops}
          subtitle="Open for buyer contracts"
          icon={<MdStorefront />}
          color="green"
          onClick={() => setActiveTab('live')}
        />
        <KPICard
          label={t('farmer.kpiSoldOut', 'Sold Out / Paused')}
          value={soldOutCrops}
          subtitle="Restock available"
          icon={<MdRefresh />}
          color="amber"
          onClick={() => setActiveTab('sold_out')}
        />
        <KPICard
          label={t('farmer.kpiTotalStock', 'Total Available Stock')}
          value={`${totalStock.toLocaleString()} Quintal`}
          subtitle="Direct farm harvest units"
          icon={<MdCheckCircle />}
          color="purple"
        />
      </Box>

      {/* 3. Filter Tabs */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              minHeight: 40,
            },
          }}
        >
          <Tab value="all" label={`All Listings (${totalCrops})`} />
          <Tab value="live" label={`Live on Mandi (${liveCrops})`} />
          <Tab value="paused" label="Paused by You" />
          <Tab value="sold_out" label={`Sold Out (${soldOutCrops})`} />
          <Tab value="pending_approval" label="Waiting for Approval" />
          <Tab value="draft" label="Drafts" />
        </Tabs>
      </Paper>

      {/* 4. Product Listings Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.cropAndVariety', 'Crop & Variety')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.grade', 'Grade')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.availableStock', 'Available Stock')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.price', 'Price / Quintal')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.status', 'Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>
                {t('common.actions', 'Action')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  {t('common.loading', 'Loading crops...')}
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" fontWeight={600} color="text.secondary">
                    {t('farmer.noCropsInTab', 'No crops found in this category.')}
                  </Typography>
                  <Button onClick={handleAddCropClick} sx={{ mt: 1.5, fontWeight: 700 }} variant="outlined" size="small">
                    {t('farmer.listYourFirstCrop', 'List a Crop Now')}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <CropImageThumbnail product={p} />
                      <Box>
                        <Typography
                          component={Link}
                          to={`/seller/products/${p.id}`}
                          variant="subtitle2"
                          fontWeight={800}
                          sx={{ color: '#0F172A', textDecoration: 'none', '&:hover': { color: '#2563EB' } }}
                        >
                          {p.crop?.name || 'Crop'} ({p.variety})
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {[p.pickup_village, p.pickup_district].filter(Boolean).join(', ') || 'Farm Gate'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: '#334155', fontWeight: 700 }}>Grade {p.grade || 'A'}</TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color={p.available_quantity > 0 ? '#0F172A' : '#EF4444'}>
                      {p.available_quantity} {p.unit || 'Quintal'}
                    </Typography>
                    {p.available_quantity <= 0 && (
                      <Typography variant="caption" color="error" fontWeight={600}>
                        Out of stock
                      </Typography>
                    )}
                  </TableCell>

                  {/* Formatted Price with Indian Number System */}
                  <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>
                    {formatINR(p.price_per_unit_paise, true, language)} / {p.unit || 'Quintal'}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StatusBadge status={p.status} role="farmer" />
                      {p.status !== 'live' && (
                        <Tooltip title="Why isn't this listing live on Mandi?">
                          <IconButton size="small" onClick={() => handleOpenExplainer(p)} sx={{ p: 0.5, color: '#94A3B8' }}>
                            <MdHelpOutline size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                      {/* Restock Button for Sold Out or 0 Stock */}
                      {(p.status === 'sold_out' || p.available_quantity <= 0) && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<MdRefresh />}
                          onClick={() => handleOpenRestock(p)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          Restock
                        </Button>
                      )}

                      {/* Pause / Resume Button for Active Lots */}
                      {p.status === 'live' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          startIcon={<MdPauseCircleOutline />}
                          onClick={() => handleTogglePause(p)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                          Pause
                        </Button>
                      )}

                      {p.status === 'paused' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<MdPlayCircleOutline />}
                          onClick={() => handleTogglePause(p)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                          Resume
                        </Button>
                      )}

                      <Tooltip title={t('common.viewDetails', 'View Crop Details')}>
                        <IconButton
                          component={Link}
                          to={`/seller/products/${p.id}`}
                          size="small"
                          sx={{ color: '#2563EB', bgcolor: '#EFF6FF', borderRadius: 2 }}
                        >
                          <MdVisibility size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 5. Restock Modal (Section 7.4.3) */}
      <Dialog open={restockModalOpen} onClose={() => setRestockModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Restock Harvest Lot</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
            Add new harvested quantity to <strong>{targetProduct?.crop?.name} ({targetProduct?.variety})</strong>. This will bring the listing back to <strong>Live on Mandi</strong>.
          </Typography>

          <TextField
            label="Additional Quantity to Add (Quintal) *"
            type="number"
            fullWidth
            size="small"
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            required
          />

          <TextField
            label="Updated Price Per Quintal (INR) (Optional)"
            type="number"
            fullWidth
            size="small"
            value={restockPrice}
            onChange={(e) => setRestockPrice(e.target.value)}
            helperText="Leave empty to maintain current unit price."
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Stock Adjustment Reason"
            fullWidth
            size="small"
            value={restockReason}
            onChange={(e) => setRestockReason(e.target.value)}
          >
            {STOCK_ADJUSTMENT_REASONS.map((r) => (
              <MenuItem key={r.code} value={r.code}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRestockModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleConfirmRestock} sx={{ fontWeight: 700 }}>
            Confirm Restock & Go Live
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. "Why isn't my listing live?" Explainer Dialog */}
      <Dialog open={explainerOpen} onClose={() => setExplainerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Listing Mandi Status Explainer</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
            {explainerProduct?.crop?.name} ({explainerProduct?.variety})
          </Typography>
          <Box sx={{ mt: 1.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            {explainerProduct?.status === 'sold_out' && (
              <Typography variant="body2" color="#B45309">
                <strong>Sold Out:</strong> Available stock has reached 0. Click the "Restock" button to add a new harvest batch and reopen orders.
              </Typography>
            )}
            {explainerProduct?.status === 'paused' && (
              <Typography variant="body2" color="#475569">
                <strong>Paused by You:</strong> You temporarily hid this listing from buyers. Click "Resume" whenever you are ready to sell.
              </Typography>
            )}
            {explainerProduct?.status === 'pending_approval' && (
              <Typography variant="body2" color="#1D4ED8">
                <strong>Waiting for Admin Review:</strong> Your listing price was significantly outside standard Mandi benchmark bands and is being reviewed for buyer trust.
              </Typography>
            )}
            {explainerProduct?.status === 'draft' && (
              <Typography variant="body2" color="#475569">
                <strong>Draft:</strong> You have not published this harvest yet. Edit the listing and submit it to go live.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExplainerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProducts;
