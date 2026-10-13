import en from './en';
import hi from './hi';
import gu from './gu';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', locale: 'en-IN', direction: 'ltr' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', locale: 'hi-IN', direction: 'ltr' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN', direction: 'ltr' },
];

export const translations = {
  en,
  hi,
  gu,
};

export default translations;
