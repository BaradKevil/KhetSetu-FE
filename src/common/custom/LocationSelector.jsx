import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import {
  getStates,
  getDistricts,
  getCities,
  getVillages,
} from '../../data/locationsData';

const CUSTOM_VILLAGE_KEY = '__OTHER_CUSTOM_VILLAGE__';

const menuStyleProps = {
  PaperProps: {
    sx: {
      maxHeight: 280,
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16)',
      p: 0.5,
      '& .MuiMenuItem-root': {
        borderRadius: '8px',
        my: 0.3,
        px: 1.5,
        py: 1,
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#1E293B',
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          bgcolor: '#EFF6FF',
          color: '#1D4ED8',
        },
        '&.Mui-selected': {
          bgcolor: '#2563EB !important', // Vibrant Blue background for selected item
          color: '#FFFFFF !important',
          fontWeight: 600,
          '&:hover': {
            bgcolor: '#1D4ED8 !important',
            color: '#FFFFFF !important',
          },
          '& .MuiTypography-root': {
            color: '#FFFFFF !important',
          },
          '& svg': {
            color: '#FFFFFF !important',
          },
        },
        '&.Mui-disabled, &.Mui-disabled.Mui-selected': {
          opacity: 0.65,
          color: '#94A3B8 !important',
          bgcolor: 'transparent !important',
        },
      },
    },
  },
};

/**
 * Reusable Cascading Location Selector
 * Hierarchy: State -> District -> City / Taluka -> Village
 *
 * @param {object} values - { state, district, city, village }
 * @param {function} onChange - Callback receiving updated { state, district, city, village }
 * @param {boolean} showVillage - Whether to display the Village dropdown
 * @param {boolean} required - Whether selections are required
 * @param {boolean} disabled - Whether the selector is disabled
 * @param {'small' | 'medium'} size - Sizing
 * @param {object} labels - Custom labels for localized text
 */
export const LocationSelector = ({
  values = { state: '', district: '', city: '', village: '' },
  onChange,
  showVillage = true,
  required = false,
  disabled = false,
  size = 'medium',
  labels = {
    state: 'State',
    district: 'District',
    city: 'City / Taluka',
    village: 'Village',
  },
}) => {
  const currentState = values?.state || '';
  const currentDistrict = values?.district || '';
  const currentCity = values?.city || '';
  const currentVillage = values?.village || '';

  const statesList = useMemo(() => getStates(), []);
  const districtsList = useMemo(() => (currentState ? getDistricts(currentState) : []), [currentState]);
  const citiesList = useMemo(() => (currentState && currentDistrict ? getCities(currentState, currentDistrict) : []), [currentState, currentDistrict]);
  const villagesList = useMemo(() => (currentState && currentDistrict && currentCity ? getVillages(currentState, currentDistrict, currentCity) : []), [currentState, currentDistrict, currentCity]);

  // Dynamic placeholders based on hierarchy progress
  const statePlaceholder = labels.selectState || 'Select State';
  const districtPlaceholder = currentState
    ? (labels.selectDistrict || 'Select District')
    : (labels.selectStateFirst || 'Select State first');
  const cityPlaceholder = currentDistrict
    ? (labels.selectCity || 'Select City / Taluka')
    : (currentState ? (labels.selectDistrictFirst || 'Select District first') : (labels.selectStateFirst || 'Select State first'));
  const villagePlaceholder = currentCity
    ? (labels.selectVillage || 'Select Village')
    : (currentDistrict ? (labels.selectCityFirst || 'Select City first') : (labels.selectDistrictFirst || 'Select District first'));

  // Determine if current village is a custom user-typed village
  const isPresetVillage = villagesList.includes(currentVillage);
  const [isCustomVillage, setIsCustomVillage] = useState(
    Boolean(currentVillage && !isPresetVillage)
  );

  useEffect(() => {
    if (currentVillage && !villagesList.includes(currentVillage)) {
      setIsCustomVillage(true);
    } else {
      setIsCustomVillage(false);
    }
  }, [currentVillage, villagesList]);

  // 1. Handle State Change (resets district, city, village)
  const handleStateChange = (e) => {
    const newState = e.target.value;
    onChange?.({
      state: newState,
      district: '',
      city: '',
      village: '',
    });
    setIsCustomVillage(false);
  };

  // 2. Handle District Change (resets city, village)
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    onChange?.({
      state: currentState,
      district: newDistrict,
      city: '',
      village: '',
    });
    setIsCustomVillage(false);
  };

  // 3. Handle City / Taluka Change (resets village)
  const handleCityChange = (e) => {
    const newCity = e.target.value;
    onChange?.({
      state: currentState,
      district: currentDistrict,
      city: newCity,
      village: '',
    });
    setIsCustomVillage(false);
  };

  // 4. Handle Village Change
  const handleVillageChange = (e) => {
    const selectedVal = e.target.value;
    if (selectedVal === CUSTOM_VILLAGE_KEY) {
      setIsCustomVillage(true);
      onChange?.({
        state: currentState,
        district: currentDistrict,
        city: currentCity,
        village: '',
      });
    } else {
      setIsCustomVillage(false);
      onChange?.({
        state: currentState,
        district: currentDistrict,
        city: currentCity,
        village: selectedVal,
      });
    }
  };

  // 5. Handle Custom Village Text Input
  const handleCustomVillageInput = (e) => {
    onChange?.({
      state: currentState,
      district: currentDistrict,
      city: currentCity,
      village: e.target.value,
    });
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Row 1: State & District */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          width: '100%',
        }}
      >
        {/* Field 1: State Dropdown */}
        <Box sx={{ minWidth: 0, width: '100%' }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#334155"
            sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
          >
            {labels.state || 'State'} {required && '*'}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={statesList.includes(currentState) ? currentState : ''}
            onChange={handleStateChange}
            disabled={disabled}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  return (
                    <Box component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                      {statePlaceholder}
                    </Box>
                  );
                }
                return selected;
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {statePlaceholder}
            </MenuItem>
            {statesList.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Field 2: District Dropdown */}
        <Box sx={{ minWidth: 0, width: '100%' }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#334155"
            sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
          >
            {labels.district || 'District'} {required && '*'}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={districtsList.includes(currentDistrict) ? currentDistrict : ''}
            onChange={handleDistrictChange}
            disabled={disabled || !districtsList.length}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  return (
                    <Box component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                      {districtPlaceholder}
                    </Box>
                  );
                }
                return selected;
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {districtPlaceholder}
            </MenuItem>
            {districtsList.map((dist) => (
              <MenuItem key={dist} value={dist}>
                {dist}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Row 2: City / Taluka & Village */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: showVillage ? { xs: '1fr', sm: '1fr 1fr' } : '1fr',
          gap: 2,
          width: '100%',
        }}
      >
        {/* Field 3: City / Taluka Dropdown */}
        <Box sx={{ minWidth: 0, width: '100%' }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#334155"
            sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
          >
            {labels.city || 'City / Taluka'} {required && '*'}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={citiesList.includes(currentCity) ? currentCity : ''}
            onChange={handleCityChange}
            disabled={disabled || !currentDistrict || !citiesList.length}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  return (
                    <Box component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                      {cityPlaceholder}
                    </Box>
                  );
                }
                return selected;
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {cityPlaceholder}
            </MenuItem>
            {citiesList.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Field 4: Village Dropdown */}
        {showVillage && (
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="#334155"
              sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
            >
              {labels.village || 'Village'} {required && '*'}
            </Typography>
            {!isCustomVillage ? (
              <TextField
                select
                fullWidth
                size={size}
                value={villagesList.includes(currentVillage) ? currentVillage : ''}
                onChange={handleVillageChange}
                disabled={disabled || !currentCity || !villagesList.length}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                          {villagePlaceholder}
                        </Box>
                      );
                    }
                    return selected;
                  },
                  MenuProps: menuStyleProps,
                }}
                InputProps={{ sx: { borderRadius: 2.5 } }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  {villagePlaceholder}
                </MenuItem>
                {villagesList.map((vil) => (
                  <MenuItem key={vil} value={vil}>
                    {vil}
                  </MenuItem>
                ))}
                <MenuItem value={CUSTOM_VILLAGE_KEY} sx={{ fontWeight: 600, color: '#2E7D32' }}>
                  ✍️ Other / Type Village...
                </MenuItem>
              </TextField>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size={size}
                  value={currentVillage}
                  onChange={handleCustomVillageInput}
                  placeholder="Type your village name"
                  autoFocus
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
                <Button
                  size={size}
                  variant="outlined"
                  onClick={() => setIsCustomVillage(false)}
                  sx={{
                    borderRadius: 2.5,
                    minWidth: 54,
                    px: 1,
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                  }}
                  title="Back to dropdown list"
                >
                  List
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LocationSelector;
