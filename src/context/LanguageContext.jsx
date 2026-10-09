import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUpdateLanguageMutation, useGetProfileQuery } from '../Api/Api';
import { SUPPORTED_LANGUAGES, translations } from '../locales';

export const LANGUAGES = SUPPORTED_LANGUAGES;

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Read initial language from persistent storage or fallback to 'en'
  const [language, setLanguageState] = useState(() => {
    const saved =
      localStorage.getItem('khetsetu_language') ||
      localStorage.getItem('preferredLanguage');
    return saved === 'hi' || saved === 'gu' || saved === 'en' ? saved : 'en';
  });

  const [hasUserManuallyChosen, setHasUserManuallyChosen] = useState(false);

  const updateLanguageMutation = useUpdateLanguageMutation();
  const { data: userProfile } = useGetProfileQuery();

  // If user profile is loaded from DB and has an explicit preferred_language, sync it
  useEffect(() => {
    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/login'));

    if (!hasUserManuallyChosen && !isAuthPage && userProfile?.preferred_language) {
      const dbLang = userProfile.preferred_language;
      if (['en', 'hi', 'gu'].includes(dbLang) && dbLang !== language) {
        setLanguageState(dbLang);
        localStorage.setItem('khetsetu_language', dbLang);
        localStorage.setItem('preferredLanguage', dbLang);
        document.documentElement.lang = dbLang;
      }
    }
  }, [userProfile, hasUserManuallyChosen, language]);

  // Keep HTML root lang tag updated
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Switch the application language immediately across frontend and backend.
   */
  const changeLanguage = useCallback(
    async (newLang) => {
      if (!['en', 'hi', 'gu'].includes(newLang)) return;

      setHasUserManuallyChosen(true);

      // 1. Immediately update local state & DOM
      setLanguageState(newLang);
      localStorage.setItem('khetsetu_language', newLang);
      localStorage.setItem('preferredLanguage', newLang);
      document.documentElement.lang = newLang;

      // 2. If user is authenticated and not on register/login, persist in MySQL database asynchronously
      const isAuthPage =
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/register') ||
          window.location.pathname.startsWith('/login'));

      const token = localStorage.getItem('accessToken');
      if (token && !isAuthPage) {
        try {
          await updateLanguageMutation.mutateAsync({ language: newLang });
        } catch (err) {
          console.warn('Could not sync language with backend:', err?.message || err);
        }
      }
    },
    [updateLanguageMutation]
  );

  /**
   * Universal translation helper.
   * Supports:
   * 1. Dot-notation: t('common.save')
   * 2. Flat keys: t('save')
   * 3. Interpolation: t('common.welcomeUser', { name: 'Ramesh' })
   * 4. Missing translation fallback to English
   * 5. Final fallback to user-provided string or key name (never undefined)
   */
  const t = useCallback(
    (key, paramsOrFallback = '', extraParams = null) => {
      if (!key || typeof key !== 'string') return '';

      const dict = translations[language] || translations.en;
      let val = undefined;

      // 1. Try dot-notation path, e.g. "common.save" or "farmer.liveListings"
      if (key.includes('.')) {
        const parts = key.split('.');
        let curr = dict;
        for (const p of parts) {
          if (curr && typeof curr === 'object' && p in curr) {
            curr = curr[p];
          } else {
            curr = undefined;
            break;
          }
        }
        val = curr;

        // Fallback to English if missing in hi or gu
        if (val === undefined && language !== 'en') {
          let fallbackCurr = translations.en;
          for (const p of parts) {
            if (fallbackCurr && typeof fallbackCurr === 'object' && p in fallbackCurr) {
              fallbackCurr = fallbackCurr[p];
            } else {
              fallbackCurr = undefined;
              break;
            }
          }
          val = fallbackCurr;
        }
      }

      // 2. Try flat key lookup in namespace or flat dictionary
      if (val === undefined) {
        if (dict && key in dict && typeof dict[key] === 'string') {
          val = dict[key];
        } else {
          // Search in sub-namespaces of current dict
          for (const ns of Object.keys(dict)) {
            if (dict[ns] && typeof dict[ns] === 'object' && key in dict[ns]) {
              val = dict[ns][key];
              break;
            }
          }
          // Fallback search in English dict
          if (val === undefined && language !== 'en') {
            const enDict = translations.en;
            if (enDict && key in enDict && typeof enDict[key] === 'string') {
              val = enDict[key];
            } else {
              for (const ns of Object.keys(enDict)) {
                if (enDict[ns] && typeof enDict[ns] === 'object' && key in enDict[ns]) {
                  val = enDict[ns][key];
                  break;
                }
              }
            }
          }
        }
      }

      // 3. Fallback to provided param or humanized key
      if (val === undefined || typeof val !== 'string') {
        if (typeof paramsOrFallback === 'string' && paramsOrFallback.trim() !== '') {
          val = paramsOrFallback;
        } else {
          const parts = key.split('.');
          val = parts[parts.length - 1];
        }
      }

      // 4. Interpolation if paramsOrFallback is an object OR extraParams is an object
      const interpolationParams =
        paramsOrFallback && typeof paramsOrFallback === 'object'
          ? paramsOrFallback
          : extraParams && typeof extraParams === 'object'
          ? extraParams
          : null;

      if (interpolationParams && typeof val === 'string') {
        let interpolated = val;
        for (const [k, v] of Object.entries(interpolationParams)) {
          interpolated = interpolated.replace(new RegExp(`{{${k}}}|{${k}}`, 'g'), String(v));
        }
        return interpolated;
      }

      return val;
    },
    [language]
  );

  // Active locale code for formatting, e.g., 'en-IN', 'hi-IN', 'gu-IN'
  const currentLangObj = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  /**
   * Locale-aware Currency Formatter (INR ₹)
   * @param {number} amount - Amount in rupees or paise
   * @param {boolean} isPaise - Whether the amount is in paise (default: false)
   */
  const formatCurrency = useCallback(
    (amount, isPaise = false) => {
      const rupees = isPaise ? Number(amount || 0) / 100 : Number(amount || 0);
      try {
        return new Intl.NumberFormat(currentLangObj.locale, {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(rupees);
      } catch {
        return `₹${rupees.toLocaleString('en-IN')}`;
      }
    },
    [currentLangObj]
  );

  /**
   * Locale-aware Number Formatter
   */
  const formatNumber = useCallback(
    (value) => {
      try {
        return new Intl.NumberFormat(currentLangObj.locale).format(Number(value || 0));
      } catch {
        return String(value);
      }
    },
    [currentLangObj]
  );

  /**
   * Locale-aware Date Formatter (Supports boolean includeTime or Intl options)
   */
  const formatDate = useCallback(
    (date, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
      if (!date) return '';
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        
        let opts = options;
        if (typeof options === 'boolean') {
          opts = options
            ? {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              }
            : {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                timeZone: 'Asia/Kolkata',
              };
        }
        return new Intl.DateTimeFormat(currentLangObj.locale || 'en-IN', opts).format(parsed);
      } catch {
        try {
          return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        } catch {
          return String(date);
        }
      }
    },
    [currentLangObj]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguage: currentLangObj,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
