import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  MdLocationOn,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdCheckCircle,
} from 'react-icons/md';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LocationSelector from '../../common/custom/LocationSelector';
import PhoneInput from '../../common/custom/PhoneInput';
import { toast } from 'react-toastify';

const BuyerAddresses = () => {
  const { t } = useLanguage();
  const { data: addressesData, isLoading } = useGetAddressesQuery();
  const addAddressMutation = useAddAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const setDefaultMutation = useSetDefaultAddressMutation();

  const addresses = Array.isArray(addressesData) ? addressesData : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    tag: 'Warehouse',
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      tag: 'Warehouse',
      recipient_name: '',
      phone: '',
      address_line: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      is_default: addresses.length === 0,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      tag: addr.tag || 'Warehouse',
      recipient_name: addr.recipient_name || '',
      phone: addr.phone || '',
      address_line: addr.address_line || '',
      city: addr.city || '',
      district: addr.district || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      is_default: addr.is_default || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.recipient_name || !form.phone || !form.address_line || !form.state || !form.pincode) {
      toast.error('Please fill in all mandatory address fields');
      return;
    }

    try {
      if (editingId) {
        await updateAddressMutation.mutateAsync({ id: editingId, ...form });
        toast.success('Delivery address updated');
      } else {
        await addAddressMutation.mutateAsync(form);
        toast.success('New delivery address added');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await deleteAddressMutation.mutateAsync(id);
      toast.success('Address removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error removing address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      toast.success('Default delivery destination updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating default address');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            📍 Delivery Destinations & Warehouses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your delivery godowns, processing mills, and retail unloading locations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MdAdd />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Add Delivery Address
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : addresses.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#F8FAF9',
              border: '2px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              fontSize: 26,
            }}
          >
            🏢
          </Box>
          <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
            No delivery addresses registered yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 420, mx: 'auto' }}>
            Add your primary warehouse or mill so farm trucks can calculate delivery distances accurately.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            Add First Warehouse
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((addr) => (
            <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }} key={addr.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  border: addr.is_default ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {addr.tag || 'Warehouse'}
                  </Typography>
                  {addr.is_default && (
                    <Chip
                      icon={<MdCheckCircle size={14} />}
                      label="DEFAULT"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ mb: 0.5 }}>
                  {addr.recipient_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📞 {addr.phone}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {addr.address_line}, {addr.city ? addr.city + ', ' : ''}
                  {addr.district}, {addr.state} - {addr.pincode}
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {!addr.is_default ? (
                    <Button size="small" onClick={() => handleSetDefault(addr.id)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Set as Default
                    </Button>
                  ) : (
                    <Box />
                  )}

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(addr)}>
                      <MdEdit size={18} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(addr.id)}>
                      <MdDeleteOutline size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingId ? 'Edit Delivery Destination' : '+ Add New Delivery Destination'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Location Tag / Nickname (e.g. Warehouse 3, Processing Mill)"
            fullWidth
            size="small"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            sx={{ my: 1.5 }}
          />
          <TextField
            label="Authorized Recipient / Manager Name *"
            fullWidth
            size="small"
            value={form.recipient_name}
            onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <PhoneInput
            label="Contact Mobile Number *"
            fullWidth
            size="small"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <TextField
            label="Address / Street / APMC Landmark *"
            fullWidth
            size="small"
            value={form.address_line}
            onChange={(e) => setForm({ ...form, address_line: e.target.value })}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ mb: 1.5 }}>
            <LocationSelector
              size="small"
              showVillage={false}
              values={{
                state: form.state,
                district: form.district,
                city: form.city,
              }}
              onChange={(loc) => {
                setForm((prev) => ({
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
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            sx={{ mb: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Destination
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerAddresses;
