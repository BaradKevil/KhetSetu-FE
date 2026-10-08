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
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { MdAddCircleOutline, MdVisibility } from 'react-icons/md';
import { useGetSellerProductsQuery, useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { getFirstImage, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';
import { toast } from 'react-toastify';

/**
 * Resilient Crop Image Component:
 * Automatically falls back to crop catalog photo if custom harvest photo fails to load.
 * Prevents MUI Avatar from collapsing to a plain single-letter grey circle.
 */
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
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: userProfile } = useGetProfileQuery();
  const { data: productsData, isLoading } = useGetSellerProductsQuery();

  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';
  const products = productsData?.items || [];

  const handleAddCropClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (kycStatus !== 'verified') {
      toast.warning(t('farmer.completeKycFirst', 'Please complete the KYC first'));
      navigate('/seller/kyc');
      return;
    }
    navigate('/seller/products/new');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('farmer.cropListingsTitle', '🌾 My Crop Listings')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('farmer.cropListingsSubtitle', 'Manage your crops listed on KhetSetu Mandi.')}
          </Typography>
        </Box>
        <Button
          onClick={handleAddCropClick}
          variant="contained"
          color="primary"
          startIcon={<MdAddCircleOutline />}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, py: 1 }}
        >
          {t('farmer.addCropBtn', 'Add Crop')}
        </Button>
      </Box>

      {/* Product Listings Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.cropAndVariety', 'Crop & Variety')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.grade', 'Grade')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('farmer.availableStock', 'Available Stock')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('common.price', 'Price')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {t('common.loading', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('farmer.noCropsListed', 'No crops listed yet.')}</Typography>
                  <Button onClick={handleAddCropClick} sx={{ mt: 1.5, fontWeight: 700 }} variant="outlined" size="small">
                    {t('farmer.listYourFirstCrop', 'List Your First Crop')}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <CropImageThumbnail product={p} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          {p.crop?.name || 'Crop'} ({p.variety})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[p.pickup_village, p.pickup_district].filter(Boolean).join(', ') || 'Farm Gate'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{p.grade}</TableCell>
                  <TableCell>
                    {p.available_quantity} {p.unit}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    ₹{(p.price_per_unit_paise / 100).toFixed(0)}/{p.unit}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status.toUpperCase()}
                      size="small"
                      color={p.status === 'live' ? 'success' : 'default'}
                      variant={p.status === 'live' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('farmer.viewDetailsTooltip', 'View Crop Details (પાકની વિગતો જુઓ)')}>
                      <IconButton component={Link} to={`/seller/products/${p.id}`} size="small" color="primary">
                        <MdVisibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default MyProducts;
