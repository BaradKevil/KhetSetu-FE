import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  MdCalendarMonth,
  MdAgriculture,
  MdAdd,
  MdTrendingUp,
  MdArrowForward,
  MdEco,
  MdDeleteOutline,
  MdCheckCircle,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useGetCropsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR } from '../../common/status';
import PageHeader from '../../common/custom/PageHeader';
import { toast } from 'react-toastify';

const HARVEST_STORAGE_KEY = 'khetsetu_farmer_harvest_plan';

export default function SellerHarvestPlanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: crops = [] } = useGetCropsQuery();

  const [harvests, setHarvests] = useState(() => {
    try {
      const saved = localStorage.getItem(HARVEST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'HP-101',
        crop_name: 'Groundnut (Mungfali / મગફળી)',
        variety: 'GG-20 (Gujarat Groundnut 20)',
        area_acres: 4.5,
        sowing_date: '2026-07-10',
        harvest_date: '2026-11-15',
        estimated_yield_quintals: 36,
        target_price_quintal: 7200,
        stage: 'Pod Formation',
        progress_pct: 75,
      },
      {
        id: 'HP-102',
        crop_name: 'Cotton (Kapas / કપાસ)',
        variety: 'Shankar-6 (BT-2)',
        area_acres: 6.0,
        sowing_date: '2026-06-25',
        harvest_date: '2026-12-05',
        estimated_yield_quintals: 48,
        target_price_quintal: 7850,
        stage: 'Boll Development',
        progress_pct: 60,
      },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    crop_name: '',
    variety: '',
    area_acres: '',
    sowing_date: '',
    harvest_date: '',
    estimated_yield_quintals: '',
    target_price_quintal: '',
    stage: 'Flowering',
  });

  useEffect(() => {
    try {
      localStorage.setItem(HARVEST_STORAGE_KEY, JSON.stringify(harvests));
    } catch {
      // ignore
    }
  }, [harvests]);

  const handleAddHarvest = () => {
    if (!form.crop_name || !form.estimated_yield_quintals || !form.harvest_date) {
      toast.warning(t('farmer.fillHarvestFields', 'Please enter crop, yield, and target harvest date.'));
      return;
    }

    const newEntry = {
      id: `HP-${Date.now().toString().slice(-4)}`,
      crop_name: form.crop_name,
      variety: form.variety || 'Standard Local Hybrid',
      area_acres: Number(form.area_acres) || 1,
      sowing_date: form.sowing_date || new Date().toISOString().split('T')[0],
      harvest_date: form.harvest_date,
      estimated_yield_quintals: Number(form.estimated_yield_quintals) || 10,
      target_price_quintal: Number(form.target_price_quintal) || 5000,
      stage: form.stage,
      progress_pct: 35,
    };

    setHarvests((prev) => [newEntry, ...prev]);
    setModalOpen(false);
    toast.success(t('farmer.harvestAddedToast', 'Harvest crop cycle logged successfully!'));
    setForm({
      crop_name: '',
      variety: '',
      area_acres: '',
      sowing_date: '',
      harvest_date: '',
      estimated_yield_quintals: '',
      target_price_quintal: '',
      stage: 'Flowering',
    });
  };

  const handleDelete = (id) => {
    setHarvests((prev) => prev.filter((h) => h.id !== id));
    toast.info(t('farmer.harvestDeleted', 'Harvest record removed.'));
  };

  const handleConvertToDraft = (h) => {
    // Store in draft storage and redirect to AddProduct wizard
    const draftData = {
      crop_name: h.crop_name,
      variety: h.variety,
      available_quantity: h.estimated_yield_quintals,
      unit: 'Quintal',
      price_per_unit: h.target_price_quintal,
      pickup_ready_date: h.harvest_date,
      from_planner: true,
    };
    try {
      localStorage.setItem('khetsetu_add_product_draft', JSON.stringify(draftData));
    } catch {
      // ignore
    }
    toast.success(
      t('farmer.convertingToDraftToast', 'Loaded planned lot into Add Crop wizard. Complete details to publish!')
    );
    navigate('/seller/products/new');
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <PageHeader
          title={t('farmer.plannerTitle', '🌱 Harvest Planner & Yield Forecast')}
          subtitle={t(
            'farmer.plannerSubtitle',
            'Log your crop sowing cycles, track vegetative stages, and 1-click convert ripe yields into verified market listings.'
          )}
          showBack={true}
        />

        <Button
          variant="contained"
          startIcon={<MdAdd size={20} />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {t('farmer.logNewHarvest', 'Log Upcoming Crop')}
        </Button>
      </Box>

      {/* Summary Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          my: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#fff',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase">
            {t('farmer.activePlannedCrops', 'Active Crop Cycles')}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="#1E293B" sx={{ mt: 0.5 }}>
            {harvests.length}
          </Typography>
          <Typography variant="body2" color="#16A34A" fontWeight={600} sx={{ mt: 0.5 }}>
            {t('farmer.inFieldNow', 'Growing in field')}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#fff',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase">
            {t('farmer.projectedTotalYield', 'Forecasted Produce')}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
            {harvests.reduce((sum, h) => sum + Number(h.estimated_yield_quintals || 0), 0)} Qtl
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            {t('farmer.readyByWinter', 'Expected Q4 Harvest')}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#fff',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase">
            {t('farmer.estimatedGrossValue', 'Projected Lot Value')}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="#16A34A" sx={{ mt: 0.5 }}>
            {formatINR(
              harvests.reduce(
                (sum, h) =>
                  sum +
                  Number(h.estimated_yield_quintals || 0) * Number(h.target_price_quintal || 0),
                0
              )
            )}
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            {t('farmer.atTargetMandiRate', 'At planned farmer target rates')}
          </Typography>
        </Paper>
      </Box>

      {/* Harvest Cards List */}
      <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
        {t('farmer.upcomingHarvestLots', 'Field Harvest Timeline')}
      </Typography>

      {harvests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed #CBD5E1',
            bgcolor: '#FAFAFA',
          }}
        >
          <MdAgriculture size={48} color="#94A3B8" />
          <Typography variant="h6" fontWeight={700} color="#475569" sx={{ mt: 1.5 }}>
            {t('farmer.noHarvestsLogged', 'No harvest cycles currently logged')}
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            {t('farmer.startLoggingHarvest', 'Click "Log Upcoming Crop" to forecast yields and schedule buyer contracts.')}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {harvests.map((h) => (
            <Paper
              key={h.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" fontWeight={800} color="#1E293B">
                      {h.crop_name}
                    </Typography>
                    <Chip
                      label={h.stage}
                      size="small"
                      sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                    {t('farmer.variety', 'Variety')}: <strong>{h.variety}</strong> • {t('farmer.sownArea', 'Planted Area')}:{' '}
                    <strong>{h.area_acres} Acres</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(h.id)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    <MdDeleteOutline size={18} />
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<MdArrowForward />}
                    onClick={() => handleConvertToDraft(h)}
                    sx={{
                      bgcolor: '#16A34A',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 2.5,
                      '&:hover': { bgcolor: '#15803D' },
                    }}
                  >
                    {t('farmer.convertToDraftListing', '1-Click Convert to Listing')}
                  </Button>
                </Box>
              </Box>

              {/* Progress & Milestone Bar */}
              <Box sx={{ mt: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} color="#64748B">
                    {t('farmer.growthMaturity', 'Maturity Progress')} ({h.progress_pct}%)
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="#2563EB">
                    {t('farmer.readyForHarvestOn', 'Harvest Window')}: {h.harvest_date}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={h.progress_pct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' },
                  }}
                />
              </Box>

              {/* Lot Projection Figures */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                  mt: 2.5,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                }}
              >
                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    {t('farmer.forecastedYield', 'Expected Yield')}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    {h.estimated_yield_quintals} Quintals
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    {t('farmer.targetFarmerPrice', 'Target Price')}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#2563EB">
                    {formatINR(h.target_price_quintal)} / Quintal
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    {t('farmer.estimatedBatchValue', 'Expected Gross Lot Value')}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#16A34A">
                    {formatINR(h.estimated_yield_quintals * h.target_price_quintal)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Log Crop Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('farmer.logNewCropModalTitle', 'Log Upcoming Crop Harvest')}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              select
              label={t('farmer.selectCropLabel', 'Crop')}
              fullWidth
              required
              value={form.crop_name}
              onChange={(e) => setForm((prev) => ({ ...prev, crop_name: e.target.value }))}
            >
              {crops.length > 0 ? (
                crops.map((c) => (
                  <MenuItem key={c.id} value={`${c.name} (${c.hindi_name || ''} / ${c.gujarati_name || ''})`}>
                    {c.name} {c.gujarati_name ? `(${c.gujarati_name})` : ''}
                  </MenuItem>
                ))
              ) : (
                [
                  'Groundnut (મગફળી)',
                  'Cotton (કપાસ)',
                  'Garlic (લસણ)',
                  'Cumin / Jeera (જીરું)',
                  'Wheat / Gehun (ઘઉં)',
                  'Castor / Divela (દિવેલા)',
                ].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label={t('farmer.varietyName', 'Variety / Seed Type')}
              fullWidth
              value={form.variety}
              onChange={(e) => setForm((prev) => ({ ...prev, variety: e.target.value }))}
              placeholder="e.g. GG-20, Shankar-6, Gujarat Garlic-4"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label={t('farmer.plantedArea', 'Area (Acres)')}
                type="number"
                value={form.area_acres}
                onChange={(e) => setForm((prev) => ({ ...prev, area_acres: e.target.value }))}
                placeholder="e.g. 5"
              />
              <TextField
                label={t('farmer.estimatedYieldQtl', 'Expected Yield (Quintals)')}
                type="number"
                required
                value={form.estimated_yield_quintals}
                onChange={(e) => setForm((prev) => ({ ...prev, estimated_yield_quintals: e.target.value }))}
                placeholder="e.g. 40"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label={t('farmer.targetPricePerQtl', 'Target Rate (₹/Quintal)')}
                type="number"
                value={form.target_price_quintal}
                onChange={(e) => setForm((prev) => ({ ...prev, target_price_quintal: e.target.value }))}
                placeholder="e.g. 6500"
              />
              <TextField
                label={t('farmer.harvestDate', 'Target Harvest Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
                required
                value={form.harvest_date}
                onChange={(e) => setForm((prev) => ({ ...prev, harvest_date: e.target.value }))}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddHarvest}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {t('farmer.saveHarvestPlan', 'Save Crop Cycle')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
