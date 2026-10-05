import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MdLocationOn,
  MdVerified,
  MdSecurity,
  MdAgriculture,
  MdLocalShipping,
  MdAccountBalance,
} from 'react-icons/md';
import { useGetProductDetailsQuery, useCreateOrderMutation } from '../../Api/Api';
import Navbar from '../../common/Navbar';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProductDetailsQuery(id);
  const createOrderMutation = useCreateOrderMutation();

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(10);
  const [address, setAddress] = useState({
    recipient_name: 'Jayesh Shah',
    phone: '+919812345678',
    address_line: 'Warehouse 4, APMC Market Yard',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380002',
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAF9' }}>
        <Navbar />
        <Container sx={{ py: 10, textAlign: 'center' }}>
          <Typography color="text.secondary">Loading crop harvest specifications...</Typography>
        </Container>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAF9' }}>
        <Navbar />
        <Container sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700}>Produce listing not found</Typography>
          <Button component={Link} to="/market" sx={{ mt: 2 }} variant="contained">
            Back to Marketplace
          </Button>
        </Container>
      </Box>
    );
  }

  const priceINR = (product.price_per_unit_paise / 100);
  const subtotal = Math.round(orderQty * priceINR);
  const buyerFee = Math.round(subtotal * 0.005);
  const totalPayable = subtotal + buyerFee;

  const handleOpenOrder = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.info('Please sign in or register to place an escrow order.');
      navigate('/login');
      return;
    }
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    try {
      await createOrderMutation.mutateAsync({
        product_id: product.id,
        quantity: Number(orderQty),
        delivery_address: address,
        payment_method: 'sandbox',
      });
      toast.success('Order placed successfully! Funds held securely in Escrow.');
      setOrderModalOpen(false);
      navigate('/buyer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating order.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAF9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* Photos */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <CardMedia
                component="img"
                height="380"
                image={
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.variety}
              />
            </Card>

            {/* Farmer Profile Badge Card */}
            <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                  }}
                >
                  <MdAgriculture />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {product.seller?.seller_profile?.full_name || 'Farmer Seller'}
                    </Typography>
                    <Chip label="Verified Farmer" size="small" color="success" icon={<MdVerified />} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {product.seller?.seller_profile?.farm_name || 'Organic Farm'} • {product.pickup_district}, {product.pickup_state}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Details & Actions */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip label={product.crop?.name} color="primary" size="small" />
              <Chip label={`Grade: ${product.grade}`} variant="outlined" size="small" />
              {product.is_organic && <Chip label="Certified Organic" color="success" size="small" />}
            </Box>

            <Typography variant="h4" fontWeight={800} color="#0F172A" gutterBottom>
              {product.variety}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 3 }}>
              <MdLocationOn size={18} color="#64748B" />
              Village {product.pickup_village}, Taluka/District {product.pickup_district}, {product.pickup_state} (PIN {product.pickup_pincode})
            </Typography>

            {/* Pricing Box */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Guaranteed Escrow Rate
              </Typography>
              <Typography variant="h3" fontWeight={800} color="#2E7D32">
                ₹{priceINR.toFixed(0)}
                <span style={{ fontSize: '1.1rem', color: '#64748B', fontWeight: 500 }}> / {product.unit}</span>
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Quantity Available
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {product.available_quantity} {product.unit}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Minimum Order Quantity
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {product.min_order_quantity} {product.unit}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Moisture Content
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {product.moisture_percentage ? `${product.moisture_percentage}%` : 'Standard'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Packaging
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {product.packaging_type || 'Jute Bags'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Escrow Guarantee Note */}
            <Alert severity="info" icon={<MdSecurity size={24} />} sx={{ mb: 3, borderRadius: 2.5 }}>
              <strong>KhetSetu Escrow Guarantee:</strong> Your payment is held securely in the platform trust vault. The farmer is paid only after you inspect and confirm delivery.
            </Alert>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleOpenOrder}
              sx={{ py: 1.6, fontSize: '1.05rem', fontWeight: 700, borderRadius: 3 }}
            >
              Order with Escrow Protection
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* Checkout Dialog */}
      <Dialog open={orderModalOpen} onClose={() => setOrderModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm Escrow Order
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Crop: {product.crop?.name} ({product.variety})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Seller: {product.seller?.seller_profile?.full_name} • Rate: ₹{priceINR}/{product.unit}
            </Typography>
          </Box>

          <TextField
            label={`Quantity to Purchase (${product.unit})`}
            type="number"
            fullWidth
            value={orderQty}
            onChange={(e) => setOrderQty(Math.max(Number(product.min_order_quantity), Number(e.target.value)))}
            inputProps={{ min: product.min_order_quantity, max: product.available_quantity }}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Delivery Location Details
          </Typography>
          <TextField
            label="Recipient Name / Business"
            fullWidth
            size="small"
            value={address.recipient_name}
            onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Contact Phone"
            fullWidth
            size="small"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Delivery Address / Warehouse"
            fullWidth
            size="small"
            value={address.address_line}
            onChange={(e) => setAddress({ ...address, address_line: e.target.value })}
            sx={{ mb: 1.5 }}
          />

          <Paper sx={{ p: 2, bgcolor: '#F8FAF9', borderRadius: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Produce Subtotal ({orderQty} {product.unit}):</Typography>
              <Typography variant="body2" fontWeight={600}>₹{subtotal.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Escrow Platform Fee (0.5%):</Typography>
              <Typography variant="body2" fontWeight={600}>₹{buyerFee.toLocaleString('en-IN')}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700}>Total Payable (Escrow Hold):</Typography>
              <Typography variant="subtitle1" fontWeight={800} color="#2E7D32">₹{totalPayable.toLocaleString('en-IN')}</Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOrderModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmOrder}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? 'Processing...' : 'Authorize Escrow Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductDetail;
