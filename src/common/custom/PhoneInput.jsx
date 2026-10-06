import { useState, useEffect } from 'react';
import { TextField, InputAdornment, Box, Typography } from '@mui/material';

/**
 * Cross-platform Indian Flag SVG component
 * Guarantees crisp rendering and baseline alignment across Windows, Mac, Android, and iOS.
 */
export const IndiaFlag = ({ size = 'medium' }) => {
  const isSmall = size === 'small';
  return (
    <Box
      component="svg"
      viewBox="0 0 24 16"
      sx={{
        width: isSmall ? 18 : 20,
        height: isSmall ? 12 : 14,
        borderRadius: '2.5px',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)',
        flexShrink: 0,
        display: 'block',
      }}
    >
      {/* Top Saffron Stripe */}
      <rect width="24" height="5.33" fill="#FF9933" />
      {/* Middle White Stripe */}
      <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
      {/* Bottom Green Stripe */}
      <rect y="10.66" width="24" height="5.33" fill="#138808" />
      {/* Ashoka Chakra */}
      <circle cx="12" cy="8" r="2.2" fill="none" stroke="#000080" strokeWidth="0.6" />
      <circle cx="12" cy="8" r="0.6" fill="#000080" />
      {/* Chakra Spokes */}
      <line x1="12" y1="5.9" x2="12" y2="10.1" stroke="#000080" strokeWidth="0.35" />
      <line x1="9.9" y1="8" x2="14.1" y2="8" stroke="#000080" strokeWidth="0.35" />
      <line x1="10.5" y1="6.5" x2="13.5" y2="9.5" stroke="#000080" strokeWidth="0.35" />
      <line x1="10.5" y1="9.5" x2="13.5" y2="6.5" stroke="#000080" strokeWidth="0.35" />
    </Box>
  );
};

/**
 * Strips non-digits and leading +91 or 0 to yield strictly 10 digits
 */
export const extractTenDigits = (val) => {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

/**
 * Formats 10 digits into "XXXXX XXXXX" for enhanced readability
 */
export const formatTenDigits = (digits) => {
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
};

/**
 * Converts any phone input into canonical "+91XXXXXXXXXX"
 */
export const toCanonicalPhone = (val) => {
  const digits = extractTenDigits(val);
  return digits ? `+91${digits}` : '';
};

/**
 * Fixed +91 Indian Phone Input Component
 * Non-modifiable +91 prefix with space and formatted 10-digit entry.
 */
const PhoneInput = ({
  value = '',
  onChange,
  label,
  placeholder = 'Enter 10-digit mobile number',
  disabled = false,
  required = false,
  error = false,
  helperText,
  name = 'phone',
  size = 'medium',
  fullWidth = true,
  variant = 'outlined',
  InputProps = {},
  slotProps = {},
  sx = {},
  autoComplete = 'off',
  ...props
}) => {
  const digits = extractTenDigits(value);
  const displayValue = formatTenDigits(digits);

  const handleInputChange = (e) => {
    const rawInput = e.target.value;
    const cleanDigits = extractTenDigits(rawInput);
    const fullCanonical = cleanDigits ? `+91${cleanDigits}` : '';

    if (onChange) {
      // Synthetic event compatible with standard (e) => setVal(e.target.value)
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name,
          value: fullCanonical,
          rawDigits: cleanDigits,
          formatted: formatTenDigits(cleanDigits),
        },
      };
      onChange(syntheticEvent, fullCanonical, cleanDigits);
    }
  };

  const adornment = (
    <InputAdornment
      position="start"
      sx={{
        mr: 1.2,
        pointerEvents: 'none',
        userSelect: 'none',
        height: 'auto',
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.9,
          color: '#1E293B',
          lineHeight: 1,
        }}
      >
        <IndiaFlag size={size} />
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: size === 'small' ? '0.85rem' : '0.95rem',
            color: '#1E293B',
            lineHeight: 1,
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            letterSpacing: '0.02em',
          }}
        >
          +91
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: '1px',
            height: size === 'small' ? 16 : 18,
            bgcolor: '#CBD5E1',
            ml: 0.4,
            mr: 0.2,
          }}
        />
      </Box>
    </InputAdornment>
  );

  const mergedInputProps = {
    startAdornment: adornment,
    sx: {
      fontWeight: 600,
      letterSpacing: '0.04em',
      ...(slotProps?.input?.sx || {}),
      ...(InputProps?.sx || {}),
    },
    ...InputProps,
    ...(slotProps?.input || {}),
  };

  return (
    <TextField
      name={name}
      value={displayValue}
      onChange={handleInputChange}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
      size={size}
      fullWidth={fullWidth}
      variant={variant}
      autoComplete={autoComplete}
      slotProps={{
        input: mergedInputProps,
        htmlInput: {
          inputMode: 'numeric',
          pattern: '[0-9]*',
          maxLength: 11, // 10 digits + 1 space separator
          autoComplete,
          ...(slotProps?.htmlInput || props.inputProps || {}),
        },
        ...slotProps,
      }}
      InputProps={mergedInputProps}
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*',
        maxLength: 11,
        autoComplete,
        ...props.inputProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2.5,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default PhoneInput;
