import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetCropsQuery, useCreateProductMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: crops } = useGetCropsQuery();
  const createProductMutation = useCreateProductMutation();

  const steps = [
    t('farmer.cropType', 'Select Crop & Variety'),
    t('farmer.pricePerUnit', 'Quantity & Pricing'),
    t('farmer.pickupAddress', 'Farm Pickup Location'),
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    crop_id: '',
    variety: '',
    grade: 'Grade A',
    total_quantity: 50,
    unit: 'Quintal',
    price_per_unit: 2800,
    min_order_quantity: 5,
    harvest_date: new Date().toISOString().split('T')[0],
    moisture_percentage: 12.0,
    is_organic: false,
    packaging_type: '50kg Jute Bags',
    pickup_state: 'Gujarat',
    pickup_district: 'Mehsana',
    pickup_village: 'Alampur',
    pickup_pincode: '382715',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
  });

  const cropsList = Array.isArray(crops) ? crops : [];
  const selectedCrop = cropsList.find((c) => c.id === Number(formData.crop_id));

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      await createProductMutation.mutateAsync({
        ...formData,
        crop_id: Number(formData.crop_id),
        total_quantity: Number(formData.total_quantity),
        price_per_unit: Number(formData.price_per_unit),
        min_order_quantity: Number(formData.min_order_quantity),
      });
      toast.success(t('farmer.cropListedSuccess', 'Crop listed successfully! Live on KhetSetu Mandi.'));
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error listing crop.'));
    }
  };

  return (
    <Box maxWidth="md" sx={{ mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('farmer.addNewCropTitle', '🌾 List Your Crop for Sale')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('farmer.addNewCropSubtitle', 'Step-by-step listing wizard designed for quick and accurate crop entries.')}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Step 1: Choose Crop & Specification
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Crop"
                  value={formData.crop_id}
                  onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                >
                  {cropsList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} {c.hindi_name ? `(${c.hindi_name})` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Variety (e.g. Lokwan, Basmati 1121, Sharbati)"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="Enter specific variety name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Quality Grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  <MenuItem value="Grade A">Grade A (Premium)</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="FAQ">FAQ (Fair Average Quality)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Harvest Date"
                  type="date"
                  value={formData.harvest_date}
                  onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_organic}
                      onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Certified Organic Harvest"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Step 2: Available Stock & Desired Price
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Available Quantity"
                  type="number"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Measuring Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <MenuItem value="Quintal">Quintal (100 kg)</MenuItem>
                  <MenuItem value="Metric Ton">Metric Ton (1000 kg)</MenuItem>
                  <MenuItem value="Kg">Kilogram (kg)</MenuItem>
                  <MenuItem value="Candy">Candy (Cotton)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Price (₹) per ${formData.unit}`}
                  type="number"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  helperText="Genuine price you wish to receive"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Order Quantity"
                  type="number"
                  value={formData.min_order_quantity}
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Moisture % (Optional)"
                  type="number"
                  value={formData.moisture_percentage}
                  onChange={(e) => setFormData({ ...formData, moisture_percentage: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Packaging Type"
                  value={formData.packaging_type}
                  onChange={(e) => setFormData({ ...formData, packaging_type: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Step 3: Farm Pickup Location
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Village / Farm Name"
                  value={formData.pickup_village}
                  onChange={(e) => setFormData({ ...formData, pickup_village: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="District"
                  value={formData.pickup_district}
                  onChange={(e) => setFormData({ ...formData, pickup_district: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.pickup_state}
                  onChange={(e) => setFormData({ ...formData, pickup_state: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.pickup_pincode}
                  onChange={(e) => setFormData({ ...formData, pickup_pincode: e.target.value })}
                />
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3, borderRadius: 2.5 }}>
              Listing will be published instantly on the live marketplace. You can pause or adjust price anytime!
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, pt: 3, borderTop: '1px solid #F1F5F9' }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            {t('common.back', 'Back')}
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? t('common.loading', 'Publishing...') : t('common.submit', 'Publish Crop Listing')}
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              {t('common.next', 'Next Step')}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AddProduct;
