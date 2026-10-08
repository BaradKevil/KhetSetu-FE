import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLocationLabel,
  toCanonicalLocation,
  getLocalizedStates,
  getLocalizedDistricts,
  getLocalizedCities,
  getLocalizedVillages,
} from '../../data/locationsI18n';

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
 * Multilingual: English, Gujarati, Hindi
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
  // Read current active language from context (default 'en')
  const { language: contextLang } = useLanguage?.() || { language: 'en' };
  const lang = labels?.lang || contextLang || 'en';

  const currentState = toCanonicalLocation(values?.state || '');
  const currentDistrict = toCanonicalLocation(values?.district || '');
  const currentCity = toCanonicalLocation(values?.city || '');
  const currentVillage = values?.village || '';

  // Localized list options based on user language
  const statesList = useMemo(() => getLocalizedStates(lang), [lang]);
  const districtsList = useMemo(
    () => (currentState ? getLocalizedDistricts(currentState, lang) : []),
    [currentState, lang]
  );
  const citiesList = useMemo(
    () => (currentState && currentDistrict ? getLocalizedCities(currentState, currentDistrict, lang) : []),
    [currentState, currentDistrict, lang]
  );
  const villagesList = useMemo(
    () => (currentState && currentDistrict && currentCity ? getLocalizedVillages(currentState, currentDistrict, currentCity, lang) : []),
    [currentState, currentDistrict, currentCity, lang]
  );

  // Dynamic placeholders based on hierarchy progress
  const statePlaceholder = labels.selectState || (lang === 'gu' ? 'રાજ્ય પસંદ કરો' : lang === 'hi' ? 'राज्य चुनें' : 'Select State');
  const districtPlaceholder = currentState
    ? (labels.selectDistrict || (lang === 'gu' ? 'જિલ્લો પસંદ કરો' : lang === 'hi' ? 'ज़िला चुनें' : 'Select District'))
    : (labels.selectStateFirst || (lang === 'gu' ? 'પહેલા રાજ્ય પસંદ કરો' : lang === 'hi' ? 'पहले राज्य चुनें' : 'Select State first'));
  const cityPlaceholder = currentDistrict
    ? (labels.selectCity || (lang === 'gu' ? 'શહેર / તાલુકો પસંદ કરો' : lang === 'hi' ? 'शहर / तालुका चुनें' : 'Select City / Taluka'))
    : (currentState
        ? (labels.selectDistrictFirst || (lang === 'gu' ? 'પહેલા જિલ્લો પસંદ કરો' : lang === 'hi' ? 'पहले ज़िला चुनें' : 'Select District first'))
        : (labels.selectStateFirst || (lang === 'gu' ? 'પહેલા રાજ્ય પસંદ કરો' : lang === 'hi' ? 'पहले राज्य चुनें' : 'Select State first')));
  const villagePlaceholder = currentCity
    ? (labels.selectVillage || (lang === 'gu' ? 'ગામ પસંદ કરો' : lang === 'hi' ? 'गाँव चुनें' : 'Select Village'))
    : (currentDistrict
        ? (labels.selectCityFirst || (lang === 'gu' ? 'પહેલા શહેર / તાલુકો પસંદ કરો' : lang === 'hi' ? 'पहले शहर / तालुका चुनें' : 'Select City first'))
        : (labels.selectDistrictFirst || (lang === 'gu' ? 'પહેલા જિલ્લો પસંદ કરો' : lang === 'hi' ? 'पहले ज़िला चुनें' : 'Select District first')));

  // Disabled states
  const isDistrictDisabled = disabled || !currentState || !districtsList.length;
  const isCityDisabled = disabled || !currentDistrict || !citiesList.length;
  const isVillageDisabled = disabled || !currentCity || !villagesList.length;

  // Intercept click on disabled/prerequisite fields to show helpful warning message
  const handleDistrictDisabledClick = () => {
    if (!currentState) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા રાજ્ય પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले राज्य चुनें'
          : 'Please select State first';
      toast.warn(msg, { toastId: 'loc-warn-state' });
    }
  };

  const handleCityDisabledClick = () => {
    if (!currentState) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા રાજ્ય પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले राज्य चुनें'
          : 'Please select State first';
      toast.warn(msg, { toastId: 'loc-warn-state' });
    } else if (!currentDistrict) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા જિલ્લો પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले ज़िला चुनें'
          : 'Please select District first';
      toast.warn(msg, { toastId: 'loc-warn-district' });
    }
  };

  const handleVillageDisabledClick = () => {
    if (!currentState) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા રાજ્ય પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले राज्य चुनें'
          : 'Please select State first';
      toast.warn(msg, { toastId: 'loc-warn-state' });
    } else if (!currentDistrict) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા જિલ્લો પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले ज़िला चुनें'
          : 'Please select District first';
      toast.warn(msg, { toastId: 'loc-warn-district' });
    } else if (!currentCity) {
      const msg =
        lang === 'gu'
          ? 'કૃપા કરીને પહેલા શહેર / તાલુકો પસંદ કરો'
          : lang === 'hi'
          ? 'कृपया पहले शहर / तालुका चुनें'
          : 'Please select City / Taluka first';
      toast.warn(msg, { toastId: 'loc-warn-city' });
    }
  };

  // Determine if current village is a custom user-typed village
  const isPresetVillage = villagesList.some((v) => v.value === currentVillage);
  const [isCustomVillage, setIsCustomVillage] = useState(
    Boolean(currentVillage && !isPresetVillage)
  );

  useEffect(() => {
    if (currentVillage && !villagesList.some((v) => v.value === currentVillage)) {
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
            {labels.state || (lang === 'gu' ? 'રાજ્ય' : lang === 'hi' ? 'राज्य' : 'State')} {required && <Box component="span" sx={{ color: '#DC2626', ml: 0.5, fontWeight: 800 }}>*</Box>}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={statesList.some((s) => s.value === currentState) ? currentState : ''}
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
                return getLocationLabel(selected, lang);
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {statePlaceholder}
            </MenuItem>
            {statesList.map((st) => (
              <MenuItem key={st.value} value={st.value}>
                {st.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Field 2: District Dropdown */}
        <Box sx={{ minWidth: 0, width: '100%', position: 'relative' }}>
          {/* Transparent click interceptor when disabled to inform the user */}
          {isDistrictDisabled && (
            <Box
              onClick={handleDistrictDisabledClick}
              sx={{
                position: 'absolute',
                top: 24,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 4,
                cursor: 'pointer',
              }}
              title={districtPlaceholder}
            />
          )}

          <Typography
            variant="caption"
            fontWeight={700}
            color="#334155"
            sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
          >
            {labels.district || (lang === 'gu' ? 'જિલ્લો' : lang === 'hi' ? 'ज़िला' : 'District')} {required && <Box component="span" sx={{ color: '#DC2626', ml: 0.5, fontWeight: 800 }}>*</Box>}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={districtsList.some((d) => d.value === currentDistrict) ? currentDistrict : ''}
            onChange={handleDistrictChange}
            disabled={isDistrictDisabled}
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
                return getLocationLabel(selected, lang);
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {districtPlaceholder}
            </MenuItem>
            {districtsList.map((dist) => (
              <MenuItem key={dist.value} value={dist.value}>
                {dist.label}
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
        <Box sx={{ minWidth: 0, width: '100%', position: 'relative' }}>
          {/* Transparent click interceptor when disabled to inform the user */}
          {isCityDisabled && (
            <Box
              onClick={handleCityDisabledClick}
              sx={{
                position: 'absolute',
                top: 24,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 4,
                cursor: 'pointer',
              }}
              title={cityPlaceholder}
            />
          )}

          <Typography
            variant="caption"
            fontWeight={700}
            color="#334155"
            sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
          >
            {labels.city || (lang === 'gu' ? 'શહેર / તાલુકો' : lang === 'hi' ? 'शहर / तालुका' : 'City / Taluka')} {required && <Box component="span" sx={{ color: '#DC2626', ml: 0.5, fontWeight: 800 }}>*</Box>}
          </Typography>
          <TextField
            select
            fullWidth
            size={size}
            value={citiesList.some((c) => c.value === currentCity) ? currentCity : ''}
            onChange={handleCityChange}
            disabled={isCityDisabled}
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
                return getLocationLabel(selected, lang);
              },
              MenuProps: menuStyleProps,
            }}
            InputProps={{ sx: { borderRadius: 2.5 } }}
          >
            <MenuItem value="" disabled sx={{ display: 'none' }}>
              {cityPlaceholder}
            </MenuItem>
            {citiesList.map((city) => (
              <MenuItem key={city.value} value={city.value}>
                {city.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Field 4: Village Dropdown */}
        {showVillage && (
          <Box sx={{ minWidth: 0, width: '100%', position: 'relative' }}>
            {/* Transparent click interceptor when disabled to inform the user */}
            {!isCustomVillage && isVillageDisabled && (
              <Box
                onClick={handleVillageDisabledClick}
                sx={{
                  position: 'absolute',
                  top: 24,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 4,
                  cursor: 'pointer',
                }}
                title={villagePlaceholder}
              />
            )}

            <Typography
              variant="caption"
              fontWeight={700}
              color="#334155"
              sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}
            >
              {labels.village || (lang === 'gu' ? 'ગામ' : lang === 'hi' ? 'गाँव' : 'Village')} {required && <Box component="span" sx={{ color: '#DC2626', ml: 0.5, fontWeight: 800 }}>*</Box>}
            </Typography>
            {!isCustomVillage ? (
              <TextField
                select
                fullWidth
                size={size}
                value={villagesList.some((v) => v.value === currentVillage) ? currentVillage : ''}
                onChange={handleVillageChange}
                disabled={isVillageDisabled}
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
                    return getLocationLabel(selected, lang);
                  },
                  MenuProps: menuStyleProps,
                }}
                InputProps={{ sx: { borderRadius: 2.5 } }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  {villagePlaceholder}
                </MenuItem>
                {villagesList.map((vil) => (
                  <MenuItem key={vil.value} value={vil.value}>
                    {vil.label}
                  </MenuItem>
                ))}
                <MenuItem value={CUSTOM_VILLAGE_KEY} sx={{ fontWeight: 600, color: '#2E7D32' }}>
                  {lang === 'gu' ? '✍️ અન્ય / ગામનું નામ લખો...' : (lang === 'hi' ? '✍️ अन्य / गाँव का नाम लिखें...' : '✍️ Other / Type Village...')}
                </MenuItem>
              </TextField>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size={size}
                  value={currentVillage}
                  onChange={handleCustomVillageInput}
                  placeholder={lang === 'gu' ? 'તમારા ગામનું નામ લખો' : (lang === 'hi' ? 'अपने गाँव का नाम लिखें' : 'Type your village name')}
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
                  {lang === 'gu' ? 'યાદી' : (lang === 'hi' ? 'सूची' : 'List')}
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
