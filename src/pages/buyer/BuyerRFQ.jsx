import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  MdAdd,
  MdDescription,
  MdLocationOn,
  MdSchedule,
  MdCheckCircle,
  MdLocalOffer,
} from 'react-icons/md';
import { useGetCropsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const INITIAL_RFQS = [
  {
    id: 'rfq_1',
    rfq_number: 'RFQ-89214',
    crop_name: 'Wheat (Gehun)',
    variety: 'Sharbati A-Grade',
    grade: 'A',
    quantity: 150,
    unit: 'Quintal',
    target_price_inr: 2850,
    delivery_state: 'Gujarat',
    delivery_district: 'Ahmedabad',
    status: 'open',
    quotes_count: 4,
    expires_in_days: 5,
    created_at: '2026-10-06T10:00:00Z',
  },
  {
    id: 'rfq_2',
    rfq_number: 'RFQ-74190',
    crop_name: 'Cotton (Kapas)',
    variety: 'Shankar-6 Long Staple',
    grade: 'A',
    quantity: 300,
    unit: 'Quintal',
    target_price_inr: 7100,
    delivery_state: 'Gujarat',
    delivery_district: 'Rajkot',
    status: 'quotes_received',
    quotes_count: 7,
    expires_in_days: 2,
    created_at: '2026-10-04T12:00:00Z',
  },
];

const BuyerRFQ = () => {
  const { t, formatCurrency } = useLanguage();
  const { data: crops } = useGetCropsQuery();
  const cropsList = Array.isArray(crops) ? crops : [];

  const [rfqs, setRfqs] = useState(() => {
    try {
      const stored = localStorage.getItem('khetsetu_rfqs');
      return stored ? JSON.parse(stored) : INITIAL_RFQS;
    } catch {
      return INITIAL_RFQS;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    crop_id: '',
    variety: '',
    grade: 'A',
    quantity: '',
    unit: 'Quintal',
    target_price_inr: '',
    delivery_state: 'Gujarat',
    delivery_district: 'Ahmedabad',
    validity_days: 7,
    notes: '',
  });

  const handlePostRfq = () => {
    if (!form.variety || !form.quantity || !form.target_price_inr) {
      toast.error('Please fill in variety, target quantity, and price');
      return;
    }

    const selectedCrop = cropsList.find((c) => String(c.id) === String(form.crop_id));
    const newRfq = {
      id: `rfq_${Date.now()}`,
      rfq_number: `RFQ-${Math.floor(10000 + Math.random() * 90000)}`,
      crop_name: selectedCrop?.name || 'Produce',
      variety: form.variety,
      grade: form.grade,
      quantity: Number(form.quantity),
      unit: form.unit,
      target_price_inr: Number(form.target_price_inr),
      delivery_state: form.delivery_state,
      delivery_district: form.delivery_district,
      status: 'open',
      quotes_count: 0,
      expires_in_days: form.validity_days,
      created_at: new Date().toISOString(),
    };

    const updated = [newRfq, ...rfqs];
    setRfqs(updated);
    try {
      localStorage.setItem('khetsetu_rfqs', JSON.stringify(updated));
    } catch {}

    toast.success('Requirement posted! Farmers in the region have been notified to submit quotes.');
    setModalOpen(false);
    setForm({
      crop_id: '',
      variety: '',
      grade: 'A',
      quantity: '',
      unit: 'Quintal',
      target_price_inr: '',
      delivery_state: 'Gujarat',
      delivery_district: 'Ahmedabad',
      validity_days: 7,
      notes: '',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            📋 Bulk Requirements & RFQs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Post required crop volumes and target rates. Receive competitive bids directly from certified farmers and FPOs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MdAdd />}
          onClick={() => setModalOpen(true)}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Post New Requirement (RFQ)
        </Button>
      </Box>

      {/* RFQs Grid */}
      <Grid container spacing={3}>
        {rfqs.map((rfq) => (
          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }} key={rfq.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  {rfq.rfq_number}
                </Typography>
                <Chip
                  label={rfq.quotes_count > 0 ? `${rfq.quotes_count} Quotes Received` : 'Open for Quotes'}
                  size="small"
                  color={rfq.quotes_count > 0 ? 'success' : 'primary'}
                  sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                />
              </Box>

              <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
                {rfq.variety}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {rfq.crop_name} • Grade: {rfq.grade}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderRadius: 2.5, mb: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Target Quantity:</Typography>
                    <Typography variant="body1" fontWeight={800}>
                      {rfq.quantity} {rfq.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Target Price:</Typography>
                    <Typography variant="body1" fontWeight={800} color="#2E7D32">
                      ₹{rfq.target_price_inr} /{rfq.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Destination:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {rfq.delivery_district}, {rfq.delivery_state}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} size={6}>
                    <Typography variant="caption" color="text.secondary">Validity:</Typography>
                    <Typography variant="body2" fontWeight={600} color="#B45309">
                      ⏳ {rfq.expires_in_days} days remaining
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Institutional Escrow settlement guaranteed on quote acceptance.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => toast.info(`Viewing quotes for ${rfq.rfq_number}`)}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Review Quotes ({rfq.quotes_count})
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Post RFQ Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>📋 Post Bulk Crop Requirement (RFQ)</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Crop Category *"
            fullWidth
            size="small"
            value={form.crop_id}
            onChange={(e) => setForm({ ...form, crop_id: e.target.value })}
            sx={{ my: 1.5 }}
          >
            {cropsList.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.category})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Desired Variety (e.g. Sharbati, Basmati 1121, Lokwan) *"
            fullWidth
            size="small"
            value={form.variety}
            onChange={(e) => setForm({ ...form, variety: e.target.value })}
            sx={{ mb: 1.5 }}
          />

          <Grid container spacing={2} sx={{ mb: 1.5 }}>
            <Grid item xs={6} size={6}>
              <TextField
                select
                label="Required Grade"
                fullWidth
                size="small"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <MenuItem value="A">Grade A</MenuItem>
                <MenuItem value="B">Grade B</MenuItem>
                <MenuItem value="C">Grade C</MenuItem>
                <MenuItem value="FAQ">FAQ Standard</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} size={6}>
              <TextField
                select
                label="Unit of Measurement"
                fullWidth
                size="small"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <MenuItem value="Quintal">Quintal (100 kg)</MenuItem>
                <MenuItem value="Tonne">Metric Tonne (1,000 kg)</MenuItem>
                <MenuItem value="Kg">Kilogram (Kg)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 1.5 }}>
            <Grid item xs={6} size={6}>
              <TextField
                label="Target Quantity *"
                fullWidth
                type="number"
                size="small"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 200"
              />
            </Grid>
            <Grid item xs={6} size={6}>
              <TextField
                label="Target Rate (₹ / Unit) *"
                fullWidth
                type="number"
                size="small"
                value={form.target_price_inr}
                onChange={(e) => setForm({ ...form, target_price_inr: e.target.value })}
                placeholder="e.g. 2800"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 1.5 }}>
            <Grid item xs={6} size={6}>
              <TextField
                label="Delivery State"
                fullWidth
                size="small"
                value={form.delivery_state}
                onChange={(e) => setForm({ ...form, delivery_state: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} size={6}>
              <TextField
                label="Delivery District"
                fullWidth
                size="small"
                value={form.delivery_district}
                onChange={(e) => setForm({ ...form, delivery_district: e.target.value })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Additional Quality & Packing Requirements"
            fullWidth
            multiline
            rows={2}
            size="small"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Moisture below 12%, packed in 50kg new jute bags."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handlePostRfq}>
            Publish RFQ to Farmers
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerRFQ;
