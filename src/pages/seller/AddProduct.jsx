import { useState, useRef, useEffect } from 'react';
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
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  MdEco,
  MdCloudUpload,
  MdCheckCircle,
  MdDelete,
  MdVisibility,
  MdInfoOutline,
  MdAgriculture,
  MdCategory,
  MdLocalShipping,
  MdHomeWork,
  MdLocationOn,
  MdAddPhotoAlternate,
  MdStar,
  MdPhotoLibrary,
} from 'react-icons/md';
import {
  useGetCropsQuery,
  useCreateProductMutation,
  useUploadDocumentMutation,
  useGetProfileQuery,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LocationSelector from '../../common/custom/LocationSelector';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../common/imageUtils';
import PageHeader from '../../common/custom/PageHeader';

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

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
          bgcolor: '#2563EB !important',
          color: '#FFFFFF !important',
          fontWeight: 600,
          '&:hover': {
            bgcolor: '#1D4ED8 !important',
            color: '#FFFFFF !important',
          },
        },
      },
    },
  },
};

const convertFileToBase64 = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

const AddProduct = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: userProfile, isLoading: isProfileLoading } = useGetProfileQuery();
  const { data: crops, isLoading: isCropsLoading } = useGetCropsQuery();
  const createProductMutation = useCreateProductMutation();
  const uploadDocMutation = useUploadDocumentMutation();

  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';

  // Strict Farmer KYC Gate: If KYC is not completed/approved, redirect directly to KYC page
  useEffect(() => {
    if (!isProfileLoading && userProfile) {
      if (kycStatus !== 'verified') {
        toast.warning(t('farmer.completeKycFirst', 'Please complete the KYC first'));
        navigate('/seller/kyc', { replace: true });
      }
    }
  }, [isProfileLoading, userProfile, kycStatus, navigate, t]);

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [certFileName, setCertFileName] = useState('');
  const [certFileSize, setCertFileSize] = useState(null);

  const steps = [
    t('farmer.cropType', 'Select Crop & Variety'),
    t('farmer.pricePerUnit', 'Quantity & Pricing'),
    t('farmer.pickupAddress', 'Farm Pickup Location'),
  ];

  const [formData, setFormData] = useState({
    crop_id: '',
    variety: '',
    grade: 'Grade A',
    total_quantity: '',
    unit: 'Kg', // Default unit as requested
    price_per_unit: '',
    min_order_quantity: 1, // Default MOQ 1 as requested
    harvest_date: new Date().toISOString().split('T')[0],
    is_organic: false,
    organic_certificate_url: '',
    packaging_type: '50kg Jute / Gunny Bags',
    pickup_state: '',
    pickup_district: '',
    pickup_city: '',
    pickup_village: '',
    pickup_pincode: '',
    pickup_address_type: 'Farm Gate / Field',
    pickup_exact_address: '',
    images: [], // Farmer must upload 1 to 5 real harvest photos
  });

  const [errors, setErrors] = useState({});

  const cropsList = Array.isArray(crops) ? crops : [];
  const selectedCrop = cropsList.find((c) => c.id === Number(formData.crop_id));

  // Packaging types with farmer-friendly multilingual labels
  const packagingTypes = [
    {
      value: '50kg Jute / Gunny Bags',
      label:
        language === 'gu'
          ? '૫૦ કિલો શણની બોરી (અનાજ/કઠોળ માટે)'
          : language === 'hi'
          ? '50 किग्रा पटसन बोरी (अनाज/दलहन मानक)'
          : '50 kg Jute / Gunny Bags (Standard Grains/Pulses)',
      desc: 'Standard 50kg biodegradable jute gunny sack',
    },
    {
      value: 'PP Woven Sacks / Plastic Bags',
      label:
        language === 'gu'
          ? 'પ્લાસ્ટિક કટ્ટા / પીપી બોરી (૨૫/૫૦ કિલો)'
          : language === 'hi'
          ? 'पीपी प्लास्टिक बोरी (25/50 किग्रा)'
          : 'PP Woven Sacks / Plastic Bags (25/50 kg)',
      desc: 'High-density polypropylene woven sack',
    },
    {
      value: 'Plastic / Wooden Crates',
      label:
        language === 'gu'
          ? 'પ્લાસ્ટિક/લાકડાના કેરેટ (શાકભાજી/ફળો)'
          : language === 'hi'
          ? 'प्लास्टिक / लकड़ी के क्रेट्स (सब्जी/फल)'
          : 'Plastic / Wooden Crates (Fruits & Veggies)',
      desc: 'Ventilated stackable crates for perishable items',
    },
    {
      value: 'Corrugated Boxes / Cartons',
      label:
        language === 'gu'
          ? 'કાર્ટન બોક્સ / પેકિંગ પેટી'
          : language === 'hi'
          ? 'कार्टन बॉक्स / गत्ते के डिब्बे'
          : 'Corrugated Boxes / Cartons (Export Grade)',
      desc: 'Export quality heavy-duty carton packaging',
    },
    {
      value: 'Bulk / Loose Load in Trolley',
      label:
        language === 'gu'
          ? 'છૂટક / ટ્રોલી / ખુલ્લો પાક (સીધો થ્રેશર/ખેતરેથી)'
          : language === 'hi'
          ? 'खुला माल / ट्रॉली (थ्रेशर/ट्रैक्टर से सीधा)'
          : 'Bulk / Loose Load (Direct Harvester / Trolley)',
      desc: 'Loose produce loaded directly into transport trolley/truck',
    },
  ];

  // Address types with farmer-friendly multilingual labels
  const addressTypes = [
    {
      value: 'Farm Gate / Field',
      label:
        language === 'gu'
          ? '🌱 ખેતર / વાડી પરથી (સીધું ખેતરેથી વેચાણ)'
          : language === 'hi'
          ? '🌱 खेत / वाड़ी (सीधे खेत से बिक्री)'
          : '🌱 Farm Gate / Field (Direct from Farm)',
    },
    {
      value: 'Warehouse / Godown',
      label:
        language === 'gu'
          ? '🏬 ગોડાઉન / વેરહાઉસ'
          : language === 'hi'
          ? '🏬 गोदाम / वेयरहाउस'
          : '🏬 Warehouse / Godown',
    },
    {
      value: 'Farmer Residence',
      label:
        language === 'gu'
          ? '🏠 ખેડૂતનું ઘર / રહેઠાણ'
          : language === 'hi'
          ? '🏠 किसान का घर / निवास स्थान'
          : '🏠 Farmer Residence / Village Home',
    },
    {
      value: 'Cold Storage',
      label:
        language === 'gu'
          ? '❄️ કોલ્ડ સ્ટોરેજ'
          : language === 'hi'
          ? '❄️ कोल्ड स्टोरेज'
          : '❄️ Cold Storage Facility',
    },
    {
      value: 'APMC Mandi Yard',
      label:
        language === 'gu'
          ? '🏛️ એપીએમસી માર્કેટ યાર્ડ'
          : language === 'hi'
          ? '🏛️ एपीएमसी मंडी यार्ड'
          : '🏛️ APMC Mandi Yard / Sub-market',
    },
  ];

  // Handle Certificate Upload
  const handleCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('farmer.fileSizeTooBig', 'File size exceeds 10MB limit. Please upload a smaller file.'));
      return;
    }

    setUploadingCert(true);
    try {
      const res = await uploadDocMutation.mutateAsync(file);
      const uploadedUrl = res?.file_url || URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        organic_certificate_url: uploadedUrl,
      }));
      setCertFileName(res?.file_name || file.name);
      setCertFileSize(res?.file_size || file.size);
      setErrors((prev) => ({ ...prev, organic_certificate_url: '' }));
      toast.success(t('farmer.fileUploadedSuccess', 'Organic certificate uploaded successfully!'));
    } catch {
      // Fallback preview
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        organic_certificate_url: localUrl,
      }));
      setCertFileName(file.name);
      setCertFileSize(file.size);
      setErrors((prev) => ({ ...prev, organic_certificate_url: '' }));
      toast.info('Certificate attached locally.');
    } finally {
      setUploadingCert(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveCert = () => {
    setFormData((prev) => ({ ...prev, organic_certificate_url: '' }));
    setCertFileName('');
    setCertFileSize(null);
  };

  // Handle Multiple Crop Photos Upload (Min 1, Max 5)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = formData.images.length;
    const availableSlots = 5 - currentCount;

    if (availableSlots <= 0) {
      toast.warning(t('farmer.maxPhotosReached', 'Maximum 5 photos allowed per product listing.'));
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.info(`Only ${availableSlots} more photo(s) can be added (Maximum 5 photos per listing).`);
    }

    setUploadingPhotos(true);
    try {
      const newUploadedUrls = [];
      for (const file of filesToUpload) {
        if (file.size > 15 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 15MB limit.`);
          continue;
        }
        try {
          const res = await uploadDocMutation.mutateAsync(file);
          if (res?.file_url) {
            newUploadedUrls.push(res.file_url);
          } else {
            const base64 = await convertFileToBase64(file);
            if (base64) newUploadedUrls.push(base64);
          }
        } catch {
          const base64 = await convertFileToBase64(file);
          if (base64) newUploadedUrls.push(base64);
        }
      }

      if (newUploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUploadedUrls],
        }));
        setErrors((prev) => ({ ...prev, images: '' }));
        toast.success(
          language === 'gu'
            ? `${newUploadedUrls.length} ફોટો સફળતાપૂર્વક જોડાયા!`
            : language === 'hi'
            ? `${newUploadedUrls.length} फ़ोटो सफलतापूर्वक जुड़ी!`
            : `${newUploadedUrls.length} photo(s) added successfully!`
        );
      }
    } catch {
      toast.error('Failed to upload photos.');
    } finally {
      setUploadingPhotos(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Remove photo from gallery
  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, images: updated };
    });
  };

  // Promote photo to index 0 (Primary Cover Photo)
  const handleSetPrimary = (indexToPromote) => {
    if (indexToPromote === 0) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const [promoted] = updated.splice(indexToPromote, 1);
      updated.unshift(promoted);
      return { ...prev, images: updated };
    });
    toast.info(
      language === 'gu'
        ? 'કવર ફોટો બદલાઈ ગયો! આ ફોટો માર્કેટપ્લેસ પર મુખ્ય દેખાશે.'
        : language === 'hi'
        ? 'कवर फ़ोटो अपडेट हुआ! यह फ़ोटो मार्केटप्लेस पर सबसे आगे दिखेगा।'
        : 'Cover photo updated! This photo will be shown first across the marketplace.'
    );
  };

  // Helper for red asterisk in labels
  const RedStar = () => (
    <Box component="span" sx={{ color: '#DC2626', ml: 0.5, fontWeight: 800, fontSize: '1rem' }}>
      *
    </Box>
  );

  // Field validation per step
  const validateCurrentStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.crop_id) {
        newErrors.crop_id = t('farmer.selectCropRequired', 'Please select a crop from the catalog.');
      }
      if (!formData.variety || !formData.variety.trim()) {
        newErrors.variety = t('farmer.varietyRequired', 'Specific crop variety is required.');
      }
      if (!formData.grade) {
        newErrors.grade = t('farmer.gradeRequired', 'Quality grade is required.');
      }
      if (!formData.harvest_date) {
        newErrors.harvest_date = t('farmer.harvestDateRequired', 'Harvest date is required.');
      }
      if (formData.is_organic && !formData.organic_certificate_url) {
        newErrors.organic_certificate_url = t(
          'farmer.organicCertificateRequired',
          'Organic certificate document is strictly required for certified organic harvest.'
        );
      }
      if (!formData.images || formData.images.length === 0) {
        newErrors.images = t(
          'farmer.photoRequired',
          'At least 1 crop photograph is mandatory. Please upload a clear photo of your harvest.'
        );
      }
    } else if (activeStep === 1) {
      const qty = Number(formData.total_quantity);
      if (!formData.total_quantity || isNaN(qty) || qty <= 0) {
        newErrors.total_quantity = t('farmer.totalQuantityRequired', 'Total available quantity is required (> 0).');
      }
      if (!formData.unit) {
        newErrors.unit = 'Measuring unit is required.';
      }
      const price = Number(formData.price_per_unit);
      if (!formData.price_per_unit || isNaN(price) || price <= 0) {
        newErrors.price_per_unit = t('farmer.pricePerUnitRequired', 'Price per unit is required (> 0).');
      }
      const moq = Number(formData.min_order_quantity);
      if (!formData.min_order_quantity || isNaN(moq) || moq < 1) {
        newErrors.min_order_quantity = t(
          'farmer.minOrderQuantityRequired',
          'Minimum order quantity is required (at least 1).'
        );
      } else if (qty > 0 && moq > qty) {
        newErrors.min_order_quantity = t(
          'farmer.minOrderQuantityInvalid',
          'Minimum order quantity cannot exceed total available quantity.'
        );
      }
      if (!formData.packaging_type) {
        newErrors.packaging_type = t('farmer.packagingTypeRequired', 'Packaging type is mandatory.');
      }
    } else if (activeStep === 2) {
      if (!formData.pickup_state) newErrors.pickup_state = 'State is required.';
      if (!formData.pickup_district) newErrors.pickup_district = 'District is required.';
      if (!formData.pickup_city) newErrors.pickup_city = 'City / Taluka is required.';
      if (!formData.pickup_village) newErrors.pickup_village = 'Village is required.';
      if (!formData.pickup_pincode || !PINCODE_REGEX.test(String(formData.pickup_pincode).trim())) {
        newErrors.pickup_pincode = t('farmer.pincodeRequired', 'Valid 6-digit postal pincode is mandatory.');
      }
      if (!formData.pickup_address_type) {
        newErrors.pickup_address_type = t('farmer.addressTypeRequired', 'Address type is required.');
      }
      if (!formData.pickup_exact_address || formData.pickup_exact_address.trim().length < 3) {
        newErrors.pickup_exact_address = t(
          'farmer.exactAddressRequired',
          'Exact address, survey number, and landmark are mandatory.'
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      if (activeStep === 0) {
        toast.error(t('farmer.step1ErrorAlert', 'Please complete all mandatory crop specifications before proceeding.'));
      } else if (activeStep === 1) {
        toast.error(t('farmer.step2ErrorAlert', 'Please complete all mandatory quantity, price, and packaging details.'));
      }
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error(t('farmer.step3ErrorAlert', 'Please complete all mandatory pickup address details before publishing.'));
      return;
    }

    if (kycStatus !== 'verified') {
      toast.warning(t('farmer.completeKycFirst', 'Please complete the KYC first'));
      navigate('/seller/kyc', { replace: true });
      return;
    }

    const finalImages =
      formData.images.length > 0
        ? formData.images
        : selectedCrop?.image_url
        ? [selectedCrop.image_url]
        : [];

    try {
      await createProductMutation.mutateAsync({
        crop_id: Number(formData.crop_id),
        variety: formData.variety.trim(),
        grade: formData.grade,
        total_quantity: Number(formData.total_quantity),
        unit: formData.unit,
        price_per_unit: Number(formData.price_per_unit),
        min_order_quantity: Number(formData.min_order_quantity),
        harvest_date: formData.harvest_date,
        is_organic: Boolean(formData.is_organic),
        organic_certificate_url: formData.is_organic ? formData.organic_certificate_url : null,
        packaging_type: formData.packaging_type,
        pickup_state: formData.pickup_state,
        pickup_district: formData.pickup_district,
        pickup_village: formData.pickup_village,
        pickup_pincode: formData.pickup_pincode.trim(),
        pickup_address_type: formData.pickup_address_type,
        pickup_exact_address: formData.pickup_exact_address.trim(),
        images: finalImages,
      });

      toast.success(t('farmer.cropListedSuccess', 'Crop listed successfully! Live on KhetSetu Mandi.'));
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error listing crop.'));
    }
  };

  // Get localized crop name for display
  const getCropDisplayName = (c) => {
    if (!c) return '';
    if (language === 'gu' && c.gujarati_name) {
      return `${c.name} (${c.gujarati_name})`;
    }
    if (language === 'hi' && c.hindi_name) {
      return `${c.name} (${c.hindi_name})`;
    }
    if (c.gujarati_name && c.hindi_name) {
      return `${c.name} (${c.gujarati_name} / ${c.hindi_name})`;
    }
    return c.name;
  };

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        title={t('farmer.addNewCropTitle', '🌾 List Your Crop for Sale')}
        subtitle={t('farmer.addNewCropSubtitle', 'Direct farmer-to-buyer crop listing wizard. All marked fields are mandatory for accurate market trade.')}
        showBack={true}
      />

      {/* Mandatory Notification Alert */}
      <Alert severity="info" sx={{ mb: 3.5, borderRadius: 3, fontWeight: 500, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
        {t('farmer.allFieldsMandatoryAlert', 'All fields and documents marked with * are strictly mandatory. Please fill all details accurately.')}
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ======================================================== */}
        {/* STEP 1: CROP & VARIETY SPECIFICATION                     */}
        {/* ======================================================== */}
        {activeStep === 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdAgriculture size={24} color="#2563EB" />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                {t('farmer.cropType', 'Step 1: Choose Crop & Specifications')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select your crop from the standard agricultural catalog and specify its variety, quality grade, and harvest date.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Field 1: Dynamic Crop Dropdown */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.cropType', 'Select Crop')} <RedStar />
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.crop_id}
                  onChange={(e) => {
                    const chosenCrop = cropsList.find((c) => c.id === Number(e.target.value));
                    setFormData({
                      ...formData,
                      crop_id: e.target.value,
                      // If crop has default unit, suggest it
                      unit: chosenCrop?.units?.[0] || formData.unit || 'Kg',
                    });
                    setErrors((prev) => ({ ...prev, crop_id: '' }));
                  }}
                  error={!!errors.crop_id}
                  helperText={errors.crop_id}
                  disabled={isCropsLoading}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) {
                        return (
                          <Box component="span" sx={{ color: '#94A3B8', fontWeight: 400 }}>
                            {t('farmer.selectCropPlaceholder', 'Select Crop')}
                          </Box>
                        );
                      }
                      const c = cropsList.find((item) => item.id === Number(selected));
                      return getCropDisplayName(c);
                    },
                    MenuProps: menuStyleProps,
                  }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  <MenuItem value="" disabled sx={{ display: 'none' }}>
                    {t('farmer.selectCropPlaceholder', 'Select Crop')}
                  </MenuItem>
                  {cropsList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {getCropDisplayName(c)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Popular Variety Chips for selected crop */}
                {selectedCrop?.varieties && selectedCrop.varieties.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {language === 'gu' ? 'જાણીતી જાતો:' : language === 'hi' ? 'लोकप्रिय किस्में:' : 'Common varieties:'}
                    </Typography>
                    {selectedCrop.varieties.map((v) => (
                      <Chip
                        key={v}
                        label={v}
                        size="small"
                        clickable
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, variety: v }));
                          setErrors((prev) => ({ ...prev, variety: '' }));
                        }}
                        sx={{
                          fontSize: '0.72rem',
                          bgcolor: formData.variety === v ? '#DCFCE7' : '#F1F5F9',
                          color: formData.variety === v ? '#15803D' : '#334155',
                          fontWeight: formData.variety === v ? 700 : 500,
                          border: formData.variety === v ? '1px solid #86EFAC' : 'none',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Field 2: Variety */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.variety', 'Variety (e.g. Lokwan, GW-496, Sharbati, Desi)')} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. લોકવન, જીડબલ્યુ-૪૯૬, શરબતી, દેશી'
                      : language === 'hi'
                      ? 'उदा. लोकवन, जीडब्ल्यू-496, शरबती, देसी'
                      : 'e.g. Lokwan, GW-496, Basmati 1121, Sharbati'
                  }
                  value={formData.variety}
                  onChange={(e) => {
                    setFormData({ ...formData, variety: e.target.value });
                    setErrors((prev) => ({ ...prev, variety: '' }));
                  }}
                  error={!!errors.variety}
                  helperText={errors.variety}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field 3: Quality Grade */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.grade', 'Quality Grade')} <RedStar />
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.grade}
                  onChange={(e) => {
                    setFormData({ ...formData, grade: e.target.value });
                    setErrors((prev) => ({ ...prev, grade: '' }));
                  }}
                  error={!!errors.grade}
                  helperText={errors.grade}
                  SelectProps={{ MenuProps: menuStyleProps }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  <MenuItem value="Grade A">
                    {language === 'gu' ? 'Grade A (ઉત્તમ / પ્રીમિયમ ગુણવત્તા)' : language === 'hi' ? 'Grade A (प्रीमियम / उत्तम गुणवत्ता)' : 'Grade A (Premium Quality)'}
                  </MenuItem>
                  <MenuItem value="Standard">
                    {language === 'gu' ? 'Standard (સામાન્ય ગુણવત્તા)' : language === 'hi' ? 'Standard (सामान्य गुणवत्ता)' : 'Standard'}
                  </MenuItem>
                  <MenuItem value="FAQ">
                    {language === 'gu' ? 'FAQ (ફેર એવરેજ ગુણવત્તા)' : language === 'hi' ? 'FAQ (उचित औसत गुणवत्ता / एफएक्यू)' : 'FAQ (Fair Average Quality)'}
                  </MenuItem>
                </TextField>
              </Grid>

              {/* Field 4: Harvest Date */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.harvestDate', 'Harvest Date')} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.harvest_date}
                  onChange={(e) => {
                    setFormData({ ...formData, harvest_date: e.target.value });
                    setErrors((prev) => ({ ...prev, harvest_date: '' }));
                  }}
                  error={!!errors.harvest_date}
                  helperText={errors.harvest_date}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field 5: Certified Organic Harvest Toggle */}
              <Grid item xs={12} size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: formData.is_organic ? '2px solid #22C55E' : '1px solid #E2E8F0',
                    bgcolor: formData.is_organic ? '#F0FDF4' : '#F8FAFC',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 2.5,
                          bgcolor: formData.is_organic ? '#DCFCE7' : '#E2E8F0',
                          color: formData.is_organic ? '#15803D' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MdEco size={24} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                          {language === 'gu'
                            ? 'સજીવ ખેતી પ્રમાણપત્ર (Certified Organic Harvest)'
                            : language === 'hi'
                            ? 'जैविक फसल प्रमाणीकरण (Certified Organic Harvest)'
                            : 'Certified Organic Harvest'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'gu'
                            ? 'જો આ પાક રાસાયણિક ખાતર વગર સજીવ પદ્ધતિથી ઉગાડેલ હોય અને પ્રમાણપત્ર હોય તો ચાલુ કરો.'
                            : language === 'hi'
                            ? 'यदि यह फसल जैविक पद्धति से उगाई गई है और आपके पास वैध प्रमाणपत्र है तो चालू करें।'
                            : 'Enable if your harvest is grown using certified organic agricultural methods.'}
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={formData.is_organic}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          is_organic: isChecked,
                          organic_certificate_url: isChecked ? prev.organic_certificate_url : '',
                        }));
                        if (!isChecked) {
                          setErrors((prev) => ({ ...prev, organic_certificate_url: '' }));
                        }
                      }}
                      color="success"
                    />
                  </Box>

                  {/* Dynamic Document Upload for Organic Certification */}
                  {formData.is_organic && (
                    <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #DCFCE7' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#15803D">
                          {t('farmer.organicCertificationTitle', 'Certified Organic Certificate')} <RedStar />
                        </Typography>
                        <Chip
                          label={language === 'gu' ? 'ફરજિયાત દસ્તાવેજ' : language === 'hi' ? 'अनिवार्य दस्तावेज़' : 'Mandatory Document'}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t(
                          'farmer.organicCertificationDesc',
                          'Upload valid Jaivik Bharat / NPOP / PGS-India Certificate (PDF, PNG, JPG - max 10MB).'
                        )}
                      </Typography>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleCertUpload}
                      />

                      {formData.organic_certificate_url ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: '#FFFFFF',
                            border: '1px solid #86EFAC',
                            flexWrap: 'wrap',
                            gap: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <MdCheckCircle size={24} color="#16A34A" />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700} color="#15803D" noWrap>
                                {certFileName || 'Organic_Certificate.pdf'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {certFileSize ? `${(certFileSize / 1024).toFixed(1)} KB • ` : ''}
                                {language === 'gu' ? 'દસ્તાવેજ સફળતાપૂર્વક જોડાયો' : language === 'hi' ? 'दस्तावेज़ सफलतापूर्वक जुड़ा' : 'Attached successfully'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<MdVisibility />}
                              onClick={() => window.open(formData.organic_certificate_url, '_blank')}
                              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                              {t('farmer.viewUploadedDoc', 'Preview')}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<MdDelete />}
                              onClick={handleRemoveCert}
                              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                              {t('farmer.removeDoc', 'Remove')}
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            border: errors.organic_certificate_url ? '2px dashed #EF4444' : '2px dashed #22C55E',
                            borderRadius: 2.5,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: '#FFFFFF',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: '#F0FDF4', borderColor: '#16A34A' },
                          }}
                        >
                          {uploadingCert ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={28} color="success" />
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {language === 'gu' ? 'પ્રમાણપત્ર અપલોડ થઈ રહ્યું છે...' : language === 'hi' ? 'प्रमाणपत्र अपलोड हो रहा है...' : 'Uploading certificate...'}
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <MdCloudUpload size={36} color="#16A34A" />
                              <Typography variant="subtitle2" fontWeight={700} color="#15803D">
                                {language === 'gu'
                                  ? 'સજીવ ખેતી પ્રમાણપત્ર પસંદ કરવા અહીં ક્લિક કરો'
                                  : language === 'hi'
                                  ? 'जैविक प्रमाणपत्र चुनने के लिए यहाँ क्लिक करें'
                                  : 'Click or Drag to Upload Organic Certificate'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                PDF, JPG, PNG (Max 10 MB)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {errors.organic_certificate_url && (
                        <Typography variant="caption" color="error" fontWeight={600} sx={{ mt: 1, display: 'block' }}>
                          {errors.organic_certificate_url}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Field 6: Crop Harvest Photos (Min 1, Max 5) */}
              <Grid item xs={12} size={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: errors.images ? '2px solid #EF4444' : '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdPhotoLibrary size={22} color="#2563EB" />
                      <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                        {t('farmer.cropPhotosTitle', 'Crop Harvest Photos (1 to 5 Photos)')} <RedStar />
                      </Typography>
                    </Box>
                    <Chip
                      icon={<MdStar style={{ color: '#F59E0B' }} />}
                      label={`${formData.images.length} / 5 ${t('farmer.photosCountBadge', 'Photos Uploaded')}`}
                      color={formData.images.length >= 1 ? 'success' : 'default'}
                      variant={formData.images.length >= 1 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    {t(
                      'farmer.cropPhotosSubtitle',
                      'Upload real photos of your harvest. Minimum 1 photo is mandatory, maximum 5. The 1st photo is your primary cover photo displayed everywhere.'
                    )}
                  </Typography>

                  <input
                    type="file"
                    ref={photoInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />

                  {/* Photo Grid & Upload Area */}
                  <Grid container spacing={2}>
                    {formData.images.map((imgUrl, idx) => (
                      <Grid item xs={6} sm={4} md={2.4} key={idx} size={{ xs: 6, sm: 4, md: 2.4 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: 2.5,
                            overflow: 'hidden',
                            border: idx === 0 ? '2.5px solid #2563EB' : '1px solid #CBD5E1',
                            boxShadow: idx === 0 ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                            aspectRatio: '1',
                            bgcolor: '#0F172A',
                          }}
                        >
                          <Box
                            component="img"
                            src={getImageUrl(imgUrl)}
                            alt={`Crop Photo ${idx + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />

                          {/* Primary Cover Badge on Index 0 */}
                          {idx === 0 ? (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 6,
                                left: 6,
                                bgcolor: 'rgba(37, 99, 235, 0.95)',
                                color: '#FFFFFF',
                                px: 1,
                                py: 0.3,
                                borderRadius: 1.5,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.3,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              }}
                            >
                              <MdStar size={13} />
                              <span>{t('farmer.primaryCoverPhoto', '⭐ Cover')}</span>
                            </Box>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => handleSetPrimary(idx)}
                              sx={{
                                position: 'absolute',
                                bottom: 6,
                                left: 6,
                                bgcolor: 'rgba(15, 23, 42, 0.85)',
                                color: '#FFFFFF',
                                px: 0.8,
                                py: 0.2,
                                borderRadius: 1.5,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#2563EB' },
                              }}
                            >
                              {t('farmer.setAsPrimary', 'Make Cover')}
                            </Button>
                          )}

                          {/* Delete Button */}
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePhoto(idx)}
                            sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              bgcolor: 'rgba(239, 68, 68, 0.9)',
                              color: '#FFFFFF',
                              p: 0.5,
                              '&:hover': { bgcolor: '#DC2626' },
                            }}
                            title="Remove photo"
                          >
                            <MdDelete size={14} />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}

                    {/* Add Photo Button / Card */}
                    {formData.images.length < 5 && (
                      <Grid item xs={6} sm={4} md={2.4} size={{ xs: 6, sm: 4, md: 2.4 }}>
                        <Box
                          onClick={() => !uploadingPhotos && photoInputRef.current?.click()}
                          sx={{
                            border: '2px dashed #94A3B8',
                            borderRadius: 2.5,
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: uploadingPhotos ? 'wait' : 'pointer',
                            bgcolor: '#F8FAFC',
                            p: 1.5,
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#2563EB',
                              bgcolor: '#EFF6FF',
                            },
                          }}
                        >
                          {uploadingPhotos ? (
                            <>
                              <CircularProgress size={24} color="primary" />
                              <Typography variant="caption" sx={{ mt: 1, fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                                {t('farmer.uploadingPhotos', 'Uploading...')}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <MdAddPhotoAlternate size={28} color="#64748B" />
                              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mt: 0.8, fontSize: '0.72rem' }}>
                                {formData.images.length === 0
                                  ? '+ Upload Photos'
                                  : `+ Add More (${5 - formData.images.length} left)`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                                JPG, PNG, WebP
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Error message if photos are missing */}
                  {errors.images && (
                    <Typography variant="caption" color="error" fontWeight={700} sx={{ mt: 1.5, display: 'block' }}>
                      ⚠️ {errors.images}
                    </Typography>
                  )}

                  {/* Informational banner about cover photo */}
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <MdInfoOutline size={16} color="#1D4ED8" />
                    <Typography variant="caption" color="#1E40AF" fontWeight={500}>
                      {language === 'gu'
                        ? '💡 ૧મો ફોટો કવર ફોટો તરીકે મંડી માર્કેટપ્લેસ અને ખરીદદારોના સર્ચ રિઝલ્ટમાં મુખ્ય દર્શાવવામાં આવશે.'
                        : language === 'hi'
                        ? '💡 पहली फ़ोटो मुख्य (कवर) फ़ोटो के रूप में मंडी मार्केटप्लेस और खरीदारों की खोज में सबसे आगे दिखेगी।'
                        : '💡 The 1st photo is used as the primary cover photo across the marketplace, buyer catalog, and search results.'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ======================================================== */}
        {/* STEP 2: AVAILABLE QUANTITY, PRICING & PACKAGING          */}
        {/* ======================================================== */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdCategory size={24} color="#2563EB" />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                {t('farmer.pricePerUnit', 'Step 2: Available Stock & Desired Price')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter accurate quantity, measuring unit (default: Kg), genuine price you wish to receive, and packaging type.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Field 1: Measuring Unit (Default: Kg) */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {language === 'gu' ? 'માપણી એકમ (Measuring Unit)' : language === 'hi' ? 'माप इकाई (Measuring Unit)' : 'Measuring Unit'} <RedStar />
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.unit}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setFormData({
                      ...formData,
                      unit: newUnit,
                      min_order_quantity: 1, // Default MOQ 1 for the new unit as requested
                    });
                    setErrors((prev) => ({ ...prev, unit: '' }));
                  }}
                  error={!!errors.unit}
                  helperText={errors.unit}
                  SelectProps={{ MenuProps: menuStyleProps }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  <MenuItem value="Kg">
                    {language === 'gu' ? 'Kilogram / કિલોગ્રામ (kg)' : language === 'hi' ? 'Kilogram / किलोग्राम (kg)' : 'Kilogram (kg)'}
                  </MenuItem>
                  <MenuItem value="Quintal">
                    {language === 'gu' ? 'Quintal / ક્વિન્ટલ (100 kg)' : language === 'hi' ? 'Quintal / क्विंटल (100 किग्रा)' : 'Quintal (100 kg)'}
                  </MenuItem>
                  <MenuItem value="Metric Ton">
                    {language === 'gu' ? 'Metric Ton / મેટ્રિક ટન (1000 kg)' : language === 'hi' ? 'Metric Ton / मीट्रिक टन (1000 किग्रा)' : 'Metric Ton (1000 kg)'}
                  </MenuItem>
                  <MenuItem value="Candy">
                    {language === 'gu' ? 'Candy / ખાંડી (કપાસ - 356 kg)' : language === 'hi' ? 'Candy / खांडी (कपास - 356 किग्रा)' : 'Candy (Cotton - 356 kg)'}
                  </MenuItem>
                </TextField>
              </Grid>

              {/* Field 2: Total Available Quantity */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {language === 'gu'
                    ? `કુલ ઉપલબ્ધ જથ્થો (${formData.unit} માં)`
                    : language === 'hi'
                    ? `कुल उपलब्ध मात्रा (${formData.unit} में)`
                    : `Total Available Quantity (in ${formData.unit})`} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. ૫૦૦ (કિલો / ક્વિન્ટલ)'
                      : language === 'hi'
                      ? 'उदा. 500 (किग्रा / क्विंटल)'
                      : 'e.g. 500'
                  }
                  value={formData.total_quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, total_quantity: e.target.value });
                    setErrors((prev) => ({ ...prev, total_quantity: '', min_order_quantity: '' }));
                  }}
                  error={!!errors.total_quantity}
                  helperText={errors.total_quantity}
                  inputProps={{ min: 0.1, step: 'any' }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field 3: Price per Unit */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {language === 'gu'
                    ? `ભાવ (₹) પ્રતિ ${formData.unit}`
                    : language === 'hi'
                    ? `मूल्य (₹) प्रति ${formData.unit}`
                    : `Price (₹) per ${formData.unit}`} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 45"
                  value={formData.price_per_unit}
                  onChange={(e) => {
                    setFormData({ ...formData, price_per_unit: e.target.value });
                    setErrors((prev) => ({ ...prev, price_per_unit: '' }));
                  }}
                  error={!!errors.price_per_unit}
                  helperText={errors.price_per_unit || t('farmer.priceHelper', 'Genuine price you wish to receive.')}
                  inputProps={{ min: 1, step: 'any' }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field 4: Minimum Order Quantity (MOQ Default: 1) */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {language === 'gu'
                    ? `લઘુત્તમ ઓર્ડર જથ્થો (${formData.unit} માં)`
                    : language === 'hi'
                    ? `न्यूनतम ऑर्डर मात्रा (${formData.unit} में)`
                    : `Minimum Order Quantity (in ${formData.unit})`} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.min_order_quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, min_order_quantity: e.target.value });
                    setErrors((prev) => ({ ...prev, min_order_quantity: '' }));
                  }}
                  error={!!errors.min_order_quantity}
                  helperText={
                    errors.min_order_quantity ||
                    t('farmer.minOrderQtyHelper', `Default: 1 ${formData.unit}. Minimum quantity a buyer must purchase per order.`)
                  }
                  inputProps={{ min: 1, step: 'any' }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field 5: Packaging Type */}
              <Grid item xs={12} size={12}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.packagingTypeLabel', 'Packaging Type')} <RedStar />
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.packaging_type}
                  onChange={(e) => {
                    setFormData({ ...formData, packaging_type: e.target.value });
                    setErrors((prev) => ({ ...prev, packaging_type: '' }));
                  }}
                  error={!!errors.packaging_type}
                  helperText={errors.packaging_type}
                  SelectProps={{ MenuProps: menuStyleProps }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  {packagingTypes.map((pt) => (
                    <MenuItem key={pt.value} value={pt.value}>
                      <Box sx={{ py: 0.3 }}>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">
                          {pt.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pt.desc}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Packaging Explanatory Information Note */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <MdInfoOutline size={18} color="#64748B" />
                  <Typography variant="caption" color="#475569">
                    {language === 'gu'
                      ? '💡 પેકિંગનો પ્રકાર: વાહન પરિવહન અને લોડિંગ માટે પાક કઈ રીતે ભરેલો છે (દા.ત. ૫૦ કિલો શણની બોરી, પ્લાસ્ટિક કેરેટ, કે છૂટો ટ્રોલી લોડ) તેની ખરીદનાર અને ટ્રાન્સપોર્ટરને સ્પષ્ટતા રહે છે.'
                      : language === 'hi'
                      ? '💡 पैकेजिंग प्रकार: परिवहन और लोडिंग के लिए फसल कैसे पैक की गई है (उदा. 50 किग्रा पटसन बोरी, प्लास्टिक क्रेट्स, या खुली ट्रॉली लोड) ताकि खरीदार और ट्रांसपोर्टर को स्पष्टता रहे।'
                      : '💡 Packaging Type defines how the produce is bagged or crated for vehicle loading & transport so freight carriers can arrange appropriate transport.'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ======================================================== */}
        {/* STEP 3: FARM PICKUP LOCATION & ACCURATE ADDRESS          */}
        {/* ======================================================== */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdLocationOn size={24} color="#E11D48" />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                {t('farmer.pickupAddress', 'Step 3: Farm Pickup Location')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select administrative location and provide exact address details so transport trucks and buyers reach your farm without delays.
            </Typography>

            {/* Cascading Location Selector (State, District, City, Village) */}
            <LocationSelector
              values={{
                state: formData.pickup_state,
                district: formData.pickup_district,
                city: formData.pickup_city,
                village: formData.pickup_village,
              }}
              onChange={(loc) => {
                setFormData((prev) => ({
                  ...prev,
                  pickup_state: loc.state,
                  pickup_district: loc.district,
                  pickup_city: loc.city,
                  pickup_village: loc.village,
                }));
                setErrors((prev) => ({
                  ...prev,
                  pickup_state: '',
                  pickup_district: '',
                  pickup_city: '',
                  pickup_village: '',
                }));
              }}
              showVillage={true}
              required={true}
              labels={{
                state: language === 'gu' ? 'રાજ્ય' : language === 'hi' ? 'राज्य' : 'State',
                district: language === 'gu' ? 'જિલ્લો' : language === 'hi' ? 'ज़िला' : 'District',
                city: language === 'gu' ? 'શહેર / તાલુકો' : language === 'hi' ? 'शहर / तालुका' : 'City / Taluka',
                village: language === 'gu' ? 'ગામ / ફાર્મનું નામ' : language === 'hi' ? 'गाँव / फार्म का नाम' : 'Village / Farm Name',
              }}
            />

            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              {/* Field: Pincode */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {language === 'gu' ? 'પોસ્ટલ પિનકોડ (Pincode)' : language === 'hi' ? 'पोस्टल पिनकोड (Pincode)' : 'Postal Pincode'} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. 380001"
                  value={formData.pickup_pincode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, pickup_pincode: clean });
                    setErrors((prev) => ({ ...prev, pickup_pincode: '' }));
                  }}
                  error={!!errors.pickup_pincode}
                  helperText={errors.pickup_pincode || '6-digit postal code'}
                  inputProps={{ maxLength: 6 }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>

              {/* Field: Address Type (New requested field) */}
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.addressTypeLabel', 'Pickup Address Type')} <RedStar />
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.pickup_address_type}
                  onChange={(e) => {
                    setFormData({ ...formData, pickup_address_type: e.target.value });
                    setErrors((prev) => ({ ...prev, pickup_address_type: '' }));
                  }}
                  error={!!errors.pickup_address_type}
                  helperText={errors.pickup_address_type}
                  SelectProps={{ MenuProps: menuStyleProps }}
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  {addressTypes.map((at) => (
                    <MenuItem key={at.value} value={at.value}>
                      {at.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Field: Exact Precise Location & Landmark (New requested field) */}
              <Grid item xs={12} size={12}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block', fontSize: '0.8rem' }}>
                  {t('farmer.exactAddressLabel', 'Exact Precise Address & Landmark (Survey / Khata No., Road)')} <RedStar />
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder={
                    language === 'gu'
                      ? 'દા.ત. સર્વે નં. ૪૨/બી, સોમનાથ મહાદેવ મંદિર પાસે, મુખ્ય કેનાલ રોડ (ટ્રક પહોંચવા માટે સ્પષ્ટ લેન્ડમાર્ક)'
                      : language === 'hi'
                      ? 'उदा. सर्वे नं. 42/बी, सोमनाथ मंदिर के पास, मुख्य नहर रोड (ट्रक पहुँचने के लिए स्पष्ट लैंडमार्क)'
                      : 'e.g. Survey No. 42/B, Near Primary School, Canal Road (Precise landmark for transport trucks)'
                  }
                  value={formData.pickup_exact_address}
                  onChange={(e) => {
                    setFormData({ ...formData, pickup_exact_address: e.target.value });
                    setErrors((prev) => ({ ...prev, pickup_exact_address: '' }));
                  }}
                  error={!!errors.pickup_exact_address}
                  helperText={
                    errors.pickup_exact_address ||
                    t(
                      'farmer.exactAddressHelper',
                      'Transporter trucks and buyers use this precise location to reach your farm/godown accurately without getting lost.'
                    )
                  }
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                />
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3, borderRadius: 2.5 }}>
              {language === 'gu'
                ? '✅ પાક પ્રકાશિત થતાં જ KhetSetu લાઈવ માર્કેટપ્લેસ પર વેચાણ માટે મૂકાઈ જશે. તમે ગમે ત્યારે ભાવ બદલી કે પાક પોઝ કરી શકો છો.'
                : language === 'hi'
                ? '✅ फसल प्रकाशित होते ही KhetSetu लाइव मार्केटप्लेस पर दिखाई देगी। आप कभी भी मूल्य बदल सकते हैं या फसल रोक सकते हैं।'
                : '✅ Listing will be published instantly on the live marketplace. You can pause or adjust price anytime!'}
            </Alert>
          </Box>
        )}

        {/* Wizard Footer Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, pt: 3, borderTop: '1px solid #F1F5F9' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2.5 }}
          >
            {t('common.back', 'Back')}
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={createProductMutation.isPending}
              sx={{ textTransform: 'none', fontWeight: 700, px: 4, py: 1.2, borderRadius: 2.5 }}
            >
              {createProductMutation.isPending
                ? t('common.loading', 'Publishing...')
                : t('common.submit', 'Publish Crop Listing')}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ textTransform: 'none', fontWeight: 700, px: 4, py: 1.2, borderRadius: 2.5 }}
            >
              {t('common.next', 'Next Step')}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AddProduct;
