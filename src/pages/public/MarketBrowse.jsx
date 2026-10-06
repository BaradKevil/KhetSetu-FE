import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { MdSearch, MdLocationOn } from 'react-icons/md';
import { useGetPublicMarketQuery, useGetCropsQuery } from '../../Api/Api';
import Navbar from '../../common/Navbar';
import { useLanguage } from '../../context/LanguageContext';

const MarketBrowse = () => {
  const { t, formatCurrency } = useLanguage();
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const { data: crops } = useGetCropsQuery();
  const { data: marketData, isLoading } = useGetPublicMarketQuery({
    crop_id: selectedCropId || undefined,
    variety: searchCrop || undefined,
    state: selectedState || undefined,
  });

  const cropsList = Array.isArray(crops) ? crops : [];
  const products = marketData?.items || [];

  return (
    <Box sx={{ bgcolor: '#F8FAF9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('market.exploreLiveMandi', '🌾 Explore Live Crop Mandi')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('market.exploreLiveMandiSubtitle', 'Browse verified harvest listings with direct farmer pricing and escrow buyer protection.')}
          </Typography>
        </Box>

        {/* Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('market.searchVarietyPlaceholder', 'Search variety (e.g. Basmati, Lokwan)...')}
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch color="#64748B" size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('market.filterByCrop', 'Filter by Crop')}
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
              >
                <MenuItem value="">{t('market.allCrops', 'All Crops')}</MenuItem>
                {cropsList.map((crop) => (
                  <MenuItem key={crop.id} value={crop.id}>
                    {crop.name} ({crop.category})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t('market.stateRegion', 'State / Region')}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <MenuItem value="">{t('market.allStates', 'All States')}</MenuItem>
                <MenuItem value="Gujarat">Gujarat</MenuItem>
                <MenuItem value="Punjab">Punjab</MenuItem>
                <MenuItem value="Haryana">Haryana</MenuItem>
                <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
                <MenuItem value="Rajasthan">Rajasthan</MenuItem>
                <MenuItem value="Maharashtra">Maharashtra</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Product Grid */}
        {isLoading ? (
          <Typography textAlign="center" py={8} color="text.secondary">
            {t('market.loadingListings', 'Loading verified crop listings...')}
          </Typography>
        ) : products.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#F8FAF9',
                border: '2px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: 32,
              }}
            >
              🌾
            </Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
              {t('market.noProductFound', 'No product found')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.6 }}>
              {searchCrop || selectedCropId || selectedState
                ? t('market.noFilteredProduce', 'No products matched your search or filter criteria. Try resetting filters.')
                : t('market.noLiveProduce', 'Currently there are no active crop listings available in the marketplace. Verified farmers can list crops directly.')}
            </Typography>
            {searchCrop || selectedCropId || selectedState ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setSearchCrop('');
                  setSelectedCropId('');
                  setSelectedState('');
                }}
              >
                {t('market.resetFilters', 'Reset Filters')}
              </Button>
            ) : (
              <Button
                component={Link}
                to="/register?role=seller"
                variant="contained"
                color="primary"
                sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                {t('market.registerAsFarmer', 'Register as Farmer to List Crops')}
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((item) => (
              <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={
                        item.images?.[0] ||
                        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.variety}
                    />
                    {item.is_organic && (
                      <Chip
                        label={t('market.organicBadge', 'Organic')}
                        size="small"
                        color="success"
                        sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flex: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        {item.crop?.name}
                      </Typography>
                      <Chip label={item.grade} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    </Box>

                    <Typography variant="h6" fontWeight={700} color="#0F172A" gutterBottom noWrap>
                      {item.variety}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <MdLocationOn color="#64748B" size={16} />
                      {item.pickup_village}, {item.pickup_district}, {item.pickup_state}
                    </Typography>

                    <Box sx={{ p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2, mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6} size={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('market.available', 'Available')}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {item.available_quantity} {item.unit}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} size={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('market.minOrder', 'Min Order')}
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {item.min_order_quantity} {item.unit}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('market.escrowPrice', 'Escrow Price')}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#2E7D32">
                          {formatCurrency(item.price_per_unit_paise, true)}
                          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>/{item.unit}</span>
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/market/${item.id}`}
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2, px: 2 }}
                      >
                        {t('market.buyNow', 'Buy Now')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MarketBrowse;
