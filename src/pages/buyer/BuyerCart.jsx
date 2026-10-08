import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Paper,
  Divider,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdDeleteOutline,
  MdAdd,
  MdRemove,
  MdStorefront,
  MdSecurity,
  MdAgriculture,
  MdArrowForward,
  MdShoppingBag,
} from 'react-icons/md';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const BuyerCart = () => {
  const { t, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const { cart, groupedBySeller, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return (
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
          🛒
        </Box>
        <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
          {t('buyer.emptyCartTitle', 'Your Cart is Empty')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.6 }}>
          {t('buyer.emptyCartDesc', 'Browse verified crop harvests with direct farmer pricing and escrow buyer protection.')}
        </Typography>
        <Button component={Link} to="/buyer/market" variant="contained" color="primary" startIcon={<MdStorefront />}>
          {t('exploreMandiListings', 'Explore Mandi Listings')}
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('buyer.cartTitle', '🛒 My Procurement Cart')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('buyer.cartSubtitle', 'Review selected harvests before placing institutional escrow orders.')}
          </Typography>
        </Box>
        <Button variant="outlined" color="inherit" size="small" onClick={clearCart} sx={{ color: '#64748B' }}>
          {t('buyer.clearAllCart', 'Clear Entire Cart')}
        </Button>
      </Box>

      {/* Agricultural Escrow Logistics Notice */}
      <Alert severity="info" icon={<MdSecurity size={22} />} sx={{ mb: 3.5, borderRadius: 2.5 }}>
        <strong>Agricultural Escrow Rule:</strong> Harvests from different farmers ship from distinct godowns/mandis. Each farmer group generates a separate Escrow Order with independent logistics tracking and payout release.
      </Alert>

      {/* Seller Groups */}
      <Grid container spacing={3.5}>
        <Grid item xs={12} lg={8} size={{ xs: 12, lg: 8 }}>
          {groupedBySeller.map((group) => (
            <Paper
              key={group.seller_id}
              elevation={0}
              sx={{
                p: 3,
                mb: 3.5,
                borderRadius: 3.5,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
              }}
            >
              {/* Seller Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#E8F5E9',
                      color: '#2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    <MdAgriculture />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      {group.seller_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      📍 {group.seller_location}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={`${group.items.length} item(s)`} size="small" sx={{ fontWeight: 700 }} />
              </Box>

              {/* Items in this Seller Group */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item) => {
                  const itemSubtotal = item.quantity * item.price_per_unit_paise;

                  return (
                    <Box
                      key={item.product_id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#F8FAF9',
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CardMedia
                          component="img"
                          image={item.image}
                          alt={item.variety}
                          sx={{ width: 68, height: 68, borderRadius: 2, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                            {item.variety}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.crop_name} • Grade: {item.grade}
                            {item.is_organic && ' • Organic'}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="#2E7D32" sx={{ mt: 0.5 }}>
                            {formatCurrency(item.price_per_unit_paise, true)} /{item.unit}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Quantity Stepper & Subtotal */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: { xs: 0, sm: 'auto' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                            <MdRemove size={16} />
                          </IconButton>
                          <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                            <MdAdd size={16} />
                          </IconButton>
                        </Box>

                        <Typography variant="subtitle2" fontWeight={800} sx={{ minWidth: 90, textAlign: 'right' }}>
                          {formatCurrency(itemSubtotal, true)}
                        </Typography>

                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.product_id)}>
                          <MdDeleteOutline size={20} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Group Footer & Checkout Button */}
              <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subtotal: {formatCurrency(group.subtotalPaise, true)} + Escrow fee: {formatCurrency(group.buyerFeePaise, true)}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#2E7D32">
                    Total: {formatCurrency(group.totalPayablePaise, true)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  endIcon={<MdArrowForward />}
                  onClick={() => navigate(`/buyer/checkout?seller_id=${group.seller_id}`)}
                  sx={{ borderRadius: 2.5, fontWeight: 800, px: 3 }}
                >
                  Checkout {group.seller_name}'s Batch
                </Button>
              </Box>
            </Paper>
          ))}
        </Grid>

        {/* Right Summary Sidebar */}
        <Grid item xs={12} lg={4} size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', position: 'sticky', top: 90 }}>
            <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
              {t('buyer.cartSummary', 'Procurement Summary')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {cart.length} product(s) across {groupedBySeller.length} farm producer(s).
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {groupedBySeller.map((g) => (
                <Box key={g.seller_id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                    🌾 {g.seller_name}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(g.totalPayablePaise, true)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                Total Escrow Volume:
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#2E7D32">
                {formatCurrency(
                  groupedBySeller.reduce((sum, g) => sum + g.totalPayablePaise, 0),
                  true
                )}
              </Typography>
            </Box>

            <Button
              component={Link}
              to="/buyer/market"
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<MdStorefront />}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              Add More Crops from Mandi
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyerCart;
