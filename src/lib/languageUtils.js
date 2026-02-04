import { franc } from 'franc-min';

// Language code to name mapping
export const LANGUAGE_NAMES = {
  'eng': 'English',
  'nld': 'Dutch',
  'deu': 'German',
  'fra': 'French',
  'spa': 'Spanish',
  'por': 'Portuguese',
  'ita': 'Italian',
  'rus': 'Russian',
  'jpn': 'Japanese',
  'kor': 'Korean',
  'cmn': 'Chinese',
  'zho': 'Chinese',
  'ara': 'Arabic',
  'hin': 'Hindi',
  'pol': 'Polish',
  'tur': 'Turkish',
  'vie': 'Vietnamese',
  'tha': 'Thai',
  'swe': 'Swedish',
  'nor': 'Norwegian',
  'dan': 'Danish',
  'fin': 'Finnish',
  'ces': 'Czech',
  'ron': 'Romanian',
  'hun': 'Hungarian',
  'ukr': 'Ukrainian',
  'ind': 'Indonesian',
  'msa': 'Malay',
  'tgl': 'Tagalog',
  'heb': 'Hebrew',
  'ell': 'Greek',
  'bul': 'Bulgarian',
  'cat': 'Catalan',
  'hrv': 'Croatian',
  'slk': 'Slovak',
  'lit': 'Lithuanian',
  'slv': 'Slovenian',
  'est': 'Estonian',
  'lav': 'Latvian',
  'und': 'Unknown'
};

export const getLanguageName = (code) => {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
};

// Detect language of a single text
export const detectLanguage = (text) => {
  if (!text || text.length < 10) return 'und';
  try {
    const langCode = franc(text);
    if (langCode === 'und') {
      // Fallback: if mostly ASCII, assume English
      const asciiRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
      if (asciiRatio > 0.7) return 'eng';
      return 'und';
    }
    return langCode;
  } catch (error) {
    return 'und';
  }
};

// Cache for language analysis results - keyed by username
const languageCache = new Map();

// Analyze all items for a user and return cached/computed language data
export const analyzeLanguages = (userData) => {
  const username = userData?.about?.name || userData?.username || 'unknown';
  const allItems = [...(userData?.comments || []), ...(userData?.posts || [])];
  
  // Create a cache key based on username and item count
  const cacheKey = `${username}-${allItems.length}`;
  
  if (languageCache.has(cacheKey)) {
    return languageCache.get(cacheKey);
  }
  
  // Analyze each item's language
  const itemsWithLanguage = allItems.map(item => {
    const text = item.body || item.comment || item.title || item.selftext || '';
    const langCode = text.length > 10 ? detectLanguage(text) : 'und';
    return {
      ...item,
      _detectedLanguage: langCode
    };
  });
  
  // Count languages
  const languageCounts = {};
  let validItems = 0;
  
  itemsWithLanguage.forEach(item => {
    if (item._detectedLanguage && item._detectedLanguage !== 'und') {
      languageCounts[item._detectedLanguage] = (languageCounts[item._detectedLanguage] || 0) + 1;
      validItems++;
    } else if (item._detectedLanguage === 'und') {
      languageCounts['und'] = (languageCounts['und'] || 0) + 1;
    }
  });
  
  const totalItems = Object.values(languageCounts).reduce((sum, c) => sum + c, 0);
  
  // Create sorted language data
  const languageData = Object.entries(languageCounts)
    .map(([code, count]) => ({
      code,
      name: getLanguageName(code),
      count,
      percentage: totalItems > 0 ? ((count / totalItems) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
  
  const dominantLanguage = languageData.length > 0 ? languageData[0].code : 'eng';
  
  const result = {
    itemsWithLanguage,
    languageCounts,
    languageData,
    dominantLanguage,
    totalItems
  };
  
  // Cache the result
  languageCache.set(cacheKey, result);
  
  return result;
};

// Clear cache (useful if user data is refreshed)
export const clearLanguageCache = () => {
  languageCache.clear();
};
