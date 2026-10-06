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
} from '@mui/material';
import { Link } from 'react-router-dom';
import { MdAddCircleOutline, MdVisibility } from 'react-icons/md';
import { useGetSellerProductsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const MyProducts = () => {
  const { t } = useLanguage();
  const { data: productsData, isLoading } = useGetSellerProductsQuery();
  const products = productsData?.items || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('farmer.cropListingsTitle', '🌾 My Crop Listings')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('farmer.cropListingsSubtitle', 'Manage your crops listed on KhetSetu Mandi.')}
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/seller/products/new"
          variant="contained"
          color="primary"
          startIcon={<MdAddCircleOutline />}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {t('farmer.addCropBtn', 'Add Crop')}
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
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
                  <Button component={Link} to="/seller/products/new" sx={{ mt: 1 }} variant="outlined" size="small">
                    {t('farmer.listYourFirstCrop', 'List Your First Crop')}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {p.crop?.name} ({p.variety})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.pickup_village}, {p.pickup_district}
                    </Typography>
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
                    <IconButton component={Link} to={`/market/${p.id}`} size="small" color="primary">
                      <MdVisibility />
                    </IconButton>
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
