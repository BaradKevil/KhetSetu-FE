import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  MdBookmark,
  MdNotificationsActive,
  MdPeople,
  MdDeleteOutline,
  MdShoppingCart,
  MdLocationOn,
  MdAddAlert,
  MdArrowForward,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const INITIAL_SAVED_PRODUCTS = [
  {
    id: 30001,
    variety: 'Gujarat Garlic-4 (GG-4)',
    crop_name: 'Garlic (लहसुन)',
    grade: 'Grade A',
    available_quantity: 50,
    unit: 'Kg',
    price_per_unit_paise: 12000,
    seller_name: 'Rameshwar Patel',
    location: 'Alampur, Mehsana, Gujarat',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80',
    is_organic: true,
  },
  {
    id: 1002,
    variety: 'Basmati 1121 Super Long',
    crop_name: 'Basmati Rice',
    grade: 'Export Grade',
    available_quantity: 120,
    unit: 'Quintal',
    price_per_unit_paise: 385000,
    seller_name: 'Gurpreet Singh',
    location: 'Karnal, Haryana',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    is_organic: true,
  },
];

const INITIAL_FOLLOWED_FARMERS = [
  {
    id: 1,
    user_id: 19,
    full_name: 'Rameshwar Patel',
    farm_name: 'Patel Organic Krishi Farm',
    village: 'Alampur',
    district: 'Mehsana',
    state: 'Gujarat',
    rating_avg: 4.9,
    total_sales_count: 34,
    crops_grown: ['Garlic (लहसुन)', 'Wheat (गेहूं)', 'Mustard (सरसों)'],
  },
];

const INITIAL_ALERTS = [
  {
    id: 'ALT-1',
    crop: 'Garlic (लहसुन)',
    variety: 'Gujarat Garlic-4 (GG-4)',
    target_price: 110,
    unit: 'Kg',
    current_market_price: 120,
    status: 'ACTIVE',
  },
  {
    id: 'ALT-2',
    crop: 'Wheat (गेहूं)',
    variety: 'Lokwan Golden',
    target_price: 2600,
    unit: 'Quintal',
    current_market_price: 2750,
    status: 'ACTIVE',
  },
];

const BuyerWatchlist = () => {
  const { t, formatCurrency } = useLanguage();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState(0); // 0: Saved Lots, 1: Followed Farmers, 2: Price Alerts
  const [savedProducts, setSavedProducts] = useState(INITIAL_SAVED_PRODUCTS);
  const [followedFarmers, setFollowedFarmers] = useState(INITIAL_FOLLOWED_FARMERS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // New alert modal
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [newCrop, setNewCrop] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [newUnit, setNewUnit] = useState('Quintal');

  const handleRemoveSaved = (id) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info('Item removed from watchlist');
  };

  const handleUnfollowFarmer = (id) => {
    setFollowedFarmers((prev) => prev.filter((f) => f.id !== id));
    toast.info('Unfollowed farmer');
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (!newCrop || !newTargetPrice) {
      toast.error('Please enter crop and target price');
      return;
    }
    const newAlt = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      crop: newCrop,
      variety: 'All Varieties',
      target_price: Number(newTargetPrice),
      unit: newUnit,
      current_market_price: Number(newTargetPrice) * 1.05,
      status: 'ACTIVE',
    };
    setAlerts((prev) => [...prev, newAlt]);
    setOpenAlertModal(false);
    setNewCrop('');
    setNewTargetPrice('');
    toast.success('Price alert configured successfully!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('buyer.watchlistTitle', '⭐ Watchlist & Saved Harvests')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('buyer.watchlistSubtitle', 'Monitor favorite produce lots, follow high-performing farmers, and set target price alerts.')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MdAddAlert />}
          onClick={() => setOpenAlertModal(true)}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Set Price Alert
        </Button>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab
            label={`Saved Produce Lots (${savedProducts.length})`}
            icon={<MdBookmark size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={`Followed Farmers (${followedFarmers.length})`}
            icon={<MdPeople size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={`Price Alerts (${alerts.length})`}
            icon={<MdNotificationsActive size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Saved Produce Lots */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {savedProducts.length === 0 ? (
            <Grid item xs={12} size={12}>
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" gutterBottom>
                  No saved produce lots yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Browse Explore Mandi and bookmark quality harvest lots to monitor them here.
                </Typography>
                <Button component={Link} to="/buyer/market" variant="contained" color="primary">
                  Explore Live Mandi
                </Button>
              </Paper>
            </Grid>
          ) : (
            savedProducts.map((p) => (
              <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="170"
                    image={p.image}
                    alt={p.variety}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {p.crop_name}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => handleRemoveSaved(p.id)}>
                        <MdDeleteOutline size={18} />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight={800} color="#0F172A" noWrap gutterBottom>
                      {p.variety}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      🌾 {p.seller_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <MdLocationOn size={14} /> {p.location}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Listed Price</Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          {formatCurrency(p.price_per_unit_paise, true)} / {p.unit}
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/buyer/listings/${p.id}`}
                        variant="contained"
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        View Lot
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* TAB 1: Followed Farmers */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {followedFarmers.map((f) => (
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }} key={f.id}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      {f.full_name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                      {f.farm_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {f.village}, {f.district}, {f.state}
                    </Typography>
                  </Box>
                  <Chip label="⭐ 4.9 RATED" color="success" size="small" sx={{ fontWeight: 800 }} />
                </Box>

                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Crops Harvested:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 0.5, mb: 2.5 }}>
                  {f.crops_grown.map((c) => (
                    <Chip key={c} label={c} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }} />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => handleUnfollowFarmer(f.id)}
                  >
                    Unfollow
                  </Button>
                  <Button
                    component={Link}
                    to={`/buyer/farmers/${f.id}`}
                    variant="outlined"
                    size="small"
                    endIcon={<MdArrowForward />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    View Farm Profile
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* TAB 2: Price Alerts */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {alerts.map((alt) => (
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }} key={alt.id}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    {alt.crop}
                  </Typography>
                  <Chip label="ALERT ACTIVE" color="primary" size="small" sx={{ fontWeight: 800 }} />
                </Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Target Buying Price</Typography>
                    <Typography variant="h6" fontWeight={800} color="#2E7D32">
                      ₹{alt.target_price} / {alt.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Current Mandi Rate</Typography>
                    <Typography variant="h6" fontWeight={700} color="#64748B">
                      ₹{alt.current_market_price} / {alt.unit}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary">
                  You will receive an instant SMS/WhatsApp and bell notification when a farmer lists at or below ₹{alt.target_price}.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Price Alert Dialog */}
      <Dialog
        open={openAlertModal}
        onClose={() => setOpenAlertModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Create Target Price Alert</DialogTitle>
        <form onSubmit={handleCreateAlert}>
          <DialogContent>
            <TextField
              label="Crop Name (e.g. Wheat, Garlic, Basmati)"
              fullWidth
              value={newCrop}
              onChange={(e) => setNewCrop(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Target Price (INR)"
              type="number"
              fullWidth
              value={newTargetPrice}
              onChange={(e) => setNewTargetPrice(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              select
              label="Unit"
              fullWidth
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="Quintal">Quintal</option>
              <option value="Kg">Kg</option>
              <option value="Metric Ton">Metric Ton</option>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenAlertModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Set Alert
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BuyerWatchlist;
