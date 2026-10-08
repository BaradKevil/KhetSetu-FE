import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MdSecurity,
  MdAdd,
  MdLocationOn,
  MdArrowBack,
  MdCheckCircle,
  MdAgriculture,
} from 'react-icons/md';
import {
  useGetProductDetailsQuery,
  useGetAddressesQuery,
  useAddAddressMutation,
  useCreateOrderMutation,
  useGetProfileQuery,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import LocationSelector from '../../common/custom/LocationSelector';
import PhoneInput from '../../common/custom/PhoneInput';
import { toast } from 'react-toastify';

const BuyerCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  const { cart, groupedBySeller, clearSellerCart, removeFromCart } = useCart();

  const productIdParam = searchParams.get('product_id');
  const qtyParam = searchParams.get('qty');
  const sellerIdParam = searchParams.get('seller_id');

  const { data: userProfile } = useGetProfileQuery();
  const { data: singleProduct, isLoading: productLoading } = useGetProductDetailsQuery(productIdParam, {
    enabled: !!productIdParam,
  });
  const { data: addressesData, isLoading: addressesLoading } = useGetAddressesQuery();
  const addAddressMutation = useAddAddressMutation();
  const createOrderMutation = useCreateOrderMutation();

  const addresses = Array.isArray(addressesData) ? addressesData : [];

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    tag: 'Primary Warehouse',
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    is_default: true,
  });

  // Select default address when loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // Determine items being checked out
  let checkoutItems = [];
  let sellerInfo = null;

  if (productIdParam && singleProduct) {
    const qty = Number(qtyParam) || singleProduct.min_order_quantity || 1;
    checkoutItems = [
      {
        product_id: singleProduct.id,
        seller_id: singleProduct.seller_id,
        seller_name: singleProduct.seller?.seller_profile?.full_name || 'Farmer',
        variety: singleProduct.variety,
        crop_name: singleProduct.crop?.name,
        grade: singleProduct.grade,
        unit: singleProduct.unit,
        price_per_unit_paise: singleProduct.price_per_unit_paise,
        quantity: qty,
      },
    ];
    sellerInfo = {
      name: singleProduct.seller?.seller_profile?.full_name || 'Farmer',
      location: `${singleProduct.pickup_district}, ${singleProduct.pickup_state}`,
    };
  } else if (sellerIdParam) {
    const group = groupedBySeller.find((g) => String(g.seller_id) === String(sellerIdParam));
    if (group) {
      checkoutItems = group.items;
      sellerInfo = {
        name: group.seller_name,
        location: group.seller_location,
      };
    }
  }

  const subtotalPaise = checkoutItems.reduce(
    (sum, item) => sum + item.quantity * item.price_per_unit_paise,
    0
  );
  const buyerFeePaise = Math.round(subtotalPaise * 0.005);
  const totalPayablePaise = subtotalPaise + buyerFeePaise;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleSaveNewAddress = async () => {
    if (!newAddressForm.recipient_name || !newAddressForm.phone || !newAddressForm.address_line || !newAddressForm.state || !newAddressForm.pincode) {
      toast.error('Please fill in all mandatory address details');
      return;
    }
    try {
      const created = await addAddressMutation.mutateAsync(newAddressForm);
      setSelectedAddressId(created.id);
      setNewAddressOpen(false);
      toast.success('Delivery address added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving address');
    }
  };

  const handleAuthorizeEscrowPayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error('No produce items selected for checkout');
      return;
    }

    try {
      // Create order for the primary item
      const primaryItem = checkoutItems[0];
      const createdOrder = await createOrderMutation.mutateAsync({
        product_id: primaryItem.product_id,
        quantity: primaryItem.quantity,
        delivery_address: {
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          address_line: selectedAddress.address_line,
          city: selectedAddress.city,
          district: selectedAddress.district,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        payment_method: 'sandbox',
      });

      if (productIdParam) {
        removeFromCart(Number(productIdParam));
      } else if (sellerIdParam) {
        clearSellerCart(Number(sellerIdParam));
      }

      toast.success('Escrow Payment Authorized! Funds secured in KhetSetu vault.');
      navigate(`/buyer/orders/${createdOrder.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error authorizing payment');
    }
  };

  if (productLoading || addressesLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          No Items in Checkout
        </Typography>
        <Button component={Link} to="/buyer/market" variant="contained" sx={{ mt: 2 }}>
          Back to Market
        </Button>
      </Paper>
    );
  }

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} to="/buyer/cart" startIcon={<MdArrowBack />} color="inherit" sx={{ fontWeight: 600, mb: 1 }}>
          Back to Cart
        </Button>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          🛡️ Escrow Checkout & Order Confirmation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your payment is held in an institutional platform vault. Funds are only transferred to the farmer after you inspect delivery.
        </Typography>
      </Box>

      <Grid container spacing={3.5}>
        {/* Left Column: Address Selection & Order Items */}
        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
          {/* Step 1: Delivery Address */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                1. Select Delivery Destination / Warehouse
              </Typography>
              <Button
                size="small"
                startIcon={<MdAdd />}
                onClick={() => setNewAddressOpen(true)}
                sx={{ fontWeight: 700 }}
              >
                + Add New Address
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAF9', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No saved delivery addresses found. Add a destination warehouse or mill.
                </Typography>
                <Button variant="contained" size="small" onClick={() => setNewAddressOpen(true)}>
                  Add Delivery Address
                </Button>
              </Box>
            ) : (
              <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                {addresses.map((addr) => (
                  <Paper
                    key={addr.id}
                    elevation={0}
                    onClick={() => setSelectedAddressId(addr.id)}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: selectedAddressId === addr.id ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                      bgcolor: selectedAddressId === addr.id ? '#F0FDF4' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FormControlLabel
                      value={addr.id}
                      control={<Radio color="success" />}
                      label=""
                      sx={{ mr: 1, mt: -0.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {addr.tag || 'Warehouse'}
                        </Typography>
                        {addr.is_default && (
                          <Typography variant="caption" sx={{ bgcolor: '#E2E8F0', px: 1, py: 0.2, borderRadius: 1, fontWeight: 700 }}>
                            Default
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="#0F172A">
                        {addr.recipient_name} ({addr.phone})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {addr.address_line}, {addr.city ? addr.city + ', ' : ''}{addr.district}, {addr.state} - {addr.pincode}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </RadioGroup>
            )}
          </Paper>

          {/* Step 2: Produce Items Review */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
              2. Produce Items from {sellerInfo?.name || 'Farmer'}
            </Typography>

            {checkoutItems.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  bgcolor: '#F8FAF9',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                    {item.variety} ({item.crop_name})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Grade: {item.grade} • Rate: {formatCurrency(item.price_per_unit_paise, true)}/{item.unit}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={700}>
                    {item.quantity} {item.unit}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="#2E7D32">
                    {formatCurrency(item.quantity * item.price_per_unit_paise, true)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right Column: Escrow Financial Summary & Payment */}
        <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
              Escrow Ledger Breakdown
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Produce Subtotal:</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(subtotalPaise, true)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Escrow Platform Fee (0.5%):</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(buyerFeePaise, true)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={800}>Total Payable (Vault Hold):</Typography>
              <Typography variant="h5" fontWeight={800} color="#2E7D32">
                {formatCurrency(totalPayablePaise, true)}
              </Typography>
            </Box>

            {/* Escrow Guarantee Highlight */}
            <Alert severity="success" icon={<MdSecurity size={24} />} sx={{ mb: 3, borderRadius: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={800}>
                100% Escrow Protection Active
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                Funds stay protected in platform trust vault. Farmer is paid after delivery confirmation and 48-hour inspection.
              </Typography>
            </Alert>

            {/* Payment Method Option */}
            <Box sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PAYMENT METHOD
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mt: 0.5 }}>
                💳 Instant Escrow Vault (Sandbox / NetBanking)
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleAuthorizeEscrowPayment}
              disabled={createOrderMutation.isPending || !selectedAddress}
              sx={{ py: 1.6, fontWeight: 800, borderRadius: 2.5, fontSize: '1rem' }}
            >
              {createOrderMutation.isPending ? 'Securing Escrow Vault...' : 'Authorize Escrow Payment'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Add New Address Modal */}
      <Dialog open={newAddressOpen} onClose={() => setNewAddressOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Add New Delivery Destination</DialogTitle>
        <DialogContent>
          <TextField
            label="Location Label / Tag (e.g. Godown 2, Mill A)"
            fullWidth
            size="small"
            value={newAddressForm.tag}
            onChange={(e) => setNewAddressForm({ ...newAddressForm, tag: e.target.value })}
            sx={{ my: 1.5 }}
          />
          <TextField
            label="Recipient Contact Person *"
            fullWidth
            size="small"
            value={newAddressForm.recipient_name}
            onChange={(e) => setNewAddressForm({ ...newAddressForm, recipient_name: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <PhoneInput
            label="Contact Mobile Number *"
            fullWidth
            size="small"
            value={newAddressForm.phone}
            onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Warehouse Address / APMC Gate / Landmark *"
            fullWidth
            size="small"
            value={newAddressForm.address_line}
            onChange={(e) => setNewAddressForm({ ...newAddressForm, address_line: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ mb: 1.5 }}>
            <LocationSelector
              size="small"
              showVillage={false}
              values={{
                state: newAddressForm.state,
                district: newAddressForm.district,
                city: newAddressForm.city,
              }}
              onChange={(loc) => {
                setNewAddressForm((prev) => ({
                  ...prev,
                  state: loc.state,
                  district: loc.district,
                  city: loc.city,
                }));
              }}
            />
          </Box>
          <TextField
            label="Pincode *"
            fullWidth
            size="small"
            value={newAddressForm.pincode}
            onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
            sx={{ mb: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setNewAddressOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveNewAddress} disabled={addAddressMutation.isPending}>
            Save Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerCheckout;
