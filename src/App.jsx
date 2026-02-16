import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './design-system.css';
import './App.css';
import { COLORS, CHART_CONFIG, getDesignTokens } from './design-tokens';
import { apiPost, resolveApiBase } from './lib/apiClient';
import { getGlobalStats } from './lib/globalStats';
import { franc } from 'franc-min';
import SupportModal from './components/SupportModal';
import TermsModal from './components/TermsModal';
import CookieConsent from './components/CookieConsent';
import HackerText from './components/HackerText';
import { AnimatedGridPattern } from './components/AnimatedGridPattern';

// Import all widgets
import {
  SearchBox,
  ContentSearch,
  AccountAge,
  LongestStreak,
  TotalKarma,
  TotalComments,
  TotalPosts,
  Contributions,
  RecentActivity,
  KarmaSplitByMonth,
  TopSubredditsTreemap,
  GenderTimeline,
  AgeTimeline,
  EngagementLeaderboard,
  ActivityHeatmap,
  ActivityByDayOfMonth,
  ActivityByWeekday,
  HourlyPulse,
  KarmaMomentum,
  LengthVsKarma,
  TopEmojis,
  FavoriteNumber,
  TopWords,
  TopWordsOverTime,
  QuestionsVsCommentary,
  LongestCapsSentence,
  SubredditBreakdown,
  ActivityByMonth,
  // GrammarMistakesWidget,
  VocabularyWidget,
  KarmaDistribution,
  CommentLengthDist,
  CommentFlow,
  WeeklySentiment,
  SubredditFlow,
  TopLocationsWidget,
  SubredditActivityOverTime,
  SentimentStreaks,
  TSNEClustering,
  PCAAnalysis,
  LanguageDetection,
  WorldMapWidget,
  RemovedCommentsOverTime,
  RemovedCommentsBySubreddit,
  PronounUsage,
  PronounPersonality,
  ReplyPatterns,
  BotDetection,
  SubredditActivityWidget,
  EditFrequency,
  EditTiming,
  LifetimeActivity,
  FamilyTree,
  FriendsNetwork,
  RelationshipStatus,
  ProfessionAnalysis,
  LocationAnalysis,
  IdentifiableImages,
  RedditPersonality,
  KarmaEfficiency,
  ActivityFrequency,
  VocabularyLevel,
  NightOwlScore,
  WeekendWarrior,
  SubredditDiversity,
  PostCommentRatio,
  ControversyIndex,
  CommentLengthComparison,
  KarmaOverTime,
  HourlyActivityComparison,
} from './widgets';
import TopWorstContent from './widgets/TopWorstContent';

// Widget size configuration - each widget specifies cols x rows it spans
const WIDGET_SIZES = {
  SearchBox: { cols: 1, rows: 2 },
  ContentSearch: { cols: 2, rows: 2 },
  AccountAge: { cols: 1, rows: 1 },
  LongestStreak: { cols: 1, rows: 2 },
  TotalKarma: { cols: 1, rows: 1 },
  TotalComments: { cols: 1, rows: 1 },
  TotalPosts: { cols: 1, rows: 1 },
  Contributions: { cols: 1, rows: 1 },
  RecentActivity: { cols: 1, rows: 2 },
  TopSubredditsTreemap: { cols: 1, rows: 2 },
  KarmaSplitByMonth: { cols: 1, rows: 2 },
  EngagementLeaderboard: { cols: 2, rows: 2 },
  GenderTimeline: { cols: 2, rows: 1 },
  AgeTimeline: { cols: 2, rows: 1 },
  ActivityHeatmap: { cols: 2, rows: 2 },
  ActivityByDayOfMonth: { cols: 2, rows: 2 },
  ActivityByWeekday: { cols: 1, rows: 2 },
  HourlyPulse: { cols: 2, rows: 2 },
  KarmaMomentum: { cols: 2, rows: 2 },
  LengthVsKarma: { cols: 2, rows: 2 },
  TopEmojis: { cols: 1, rows: 2 },
  FavoriteNumber: { cols: 1, rows: 2 },
  TopWords: { cols: 2, rows: 2 },
  TopWordsOverTime: { cols: 2, rows: 2 },
  QuestionsVsCommentary: { cols: 2, rows: 1 },
  LongestCapsSentence: { cols: 1, rows: 1 },
  SubredditBreakdown: { cols: 1, rows: 3 },
  ActivityByMonth: { cols: 1, rows: 2 },
  // GrammarMistakesWidget: { cols: 3, rows: 2 },
  VocabularyWidget: { cols: 1, rows: 2 },
  TopWorstContent: { cols: 4, rows: 2 },
  KarmaDistribution: { cols: 2, rows: 2 },
  CommentLengthDist: { cols: 2, rows: 2 },
  CommentFlow: { cols: 4, rows: 2 },
  WeeklySentiment: { cols: 2, rows: 2 },
  SubredditFlow: { cols: 2, rows: 2 },
  TopLocationsWidget: { cols: 2, rows: 2 },
  SubredditActivityOverTime: { cols: 2, rows: 2 },
  SentimentStreaks: { cols: 2, rows: 2 },
  TSNEClustering: { cols: 2, rows: 2 },
  PCAAnalysis: { cols: 2, rows: 2 },
  LanguageDetection: { cols: 2, rows: 2 },
  WorldMapWidget: { cols: 2, rows: 2 },
  RemovedCommentsOverTime: { cols: 2, rows: 2 },
  RemovedCommentsBySubreddit: { cols: 2, rows: 2 },
  PronounUsage: { cols: 2, rows: 2 },
  PronounPersonality: { cols: 2, rows: 2 },
  ReplyPatterns: { cols: 2, rows: 2 },
  BotDetection: { cols: 2, rows: 2 },
  InterestWidget: { cols: 2, rows: 2 },
  EditFrequency: { cols: 2, rows: 2 },
  EditTiming: { cols: 2, rows: 2 },
  LifetimeActivity: { cols: 4, rows: 2 },
  FamilyTree: { cols: 1, rows: 2 },
  FriendsNetwork: { cols: 1, rows: 2 },
  RelationshipStatus: { cols: 1, rows: 2 },
  ProfessionAnalysis: { cols: 1, rows: 2 },
  LocationAnalysis: { cols: 2, rows: 2 },
  IdentifiableImages: { cols: 2, rows: 2 },

  // Comparison widgets
  RedditPersonality: { cols: 2, rows: 2 },
  KarmaEfficiency: { cols: 2, rows: 2 },
  ActivityFrequency: { cols: 2, rows: 2 },
  VocabularyLevel: { cols: 2, rows: 2 },
  NightOwlScore: { cols: 2, rows: 2 },
  WeekendWarrior: { cols: 2, rows: 2 },
  SubredditDiversity: { cols: 2, rows: 2 },
  PostCommentRatio: { cols: 2, rows: 2 },
  ControversyIndex: { cols: 2, rows: 2 },
  CommentLengthComparison: { cols: 2, rows: 2 },
  KarmaOverTime: { cols: 2, rows: 2 },
  HourlyActivityComparison: { cols: 2, rows: 2 },
};

// Helper to get grid style for a widget
const getSize = (name) => {
  const size = WIDGET_SIZES[name] || { cols: 1, rows: 1 };
  return {
    gridColumn: `span ${size.cols}`,
    gridRow: `span ${size.rows}`,
  };
};

function App() {
  const [userData, setUserData] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedTrait, setSelectedTrait] = useState('Openness');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedSubIndex, setHighlightedSubIndex] = useState(null);
  const [grammarMistakes, setGrammarMistakes] = useState([]);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarChecked, setGrammarChecked] = useState(false);
  const grammarCheckStarted = useRef(false);
  const [apiBase, setApiBase] = useState(null);
  const [ageGenderPredictions, setAgeGenderPredictions] = useState(null);
  const [ageGenderLoading, setAgeGenderLoading] = useState(false);
  const [ageGenderError, setAgeGenderError] = useState(null);
  const [focusedWidget, setFocusedWidget] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [highlightedCountries, setHighlightedCountries] = useState(new Set());
  const [locationConfidence, setLocationConfidence] = useState({ location: null, timezone: null, language: null });
  const [aiLocationData, setAiLocationData] = useState(null);
  const widgetRefs = useRef({});
  
  // Parse URL query parameter for username (e.g., ?username=XXX)
  const urlUsername = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('username') || null;
  }, []);

  // Fetch global stats once on app load
  useEffect(() => {
    getGlobalStats()
      .then(setGlobalStats)
      .catch(err => {
        console.error('Failed to load global stats:', err);
        // Set fallback defaults
        setGlobalStats({
          karma_per_item: 10,
          activity_per_day: 0.5,
          comment_length: 75,
          subreddit_count: 50,
          night_pct: 15,
          weekend_pct: 30,
          controversy_pct: 8,
          ttr: 40,
          karma_efficiency: 10
        });
      });
  }, []);

  // Check if user has any removed content
  const hasRemovedContent = useMemo(() => {
    if (!userData) return false;
    const username = (userData?.username || userData?.about?.name || '').toLowerCase();
    const allComments = userData?.comments || [];
    const allPosts = userData?.posts || [];
    
    const isRemovedComment = (comment) => {
      const author = (comment.author || '').toLowerCase();
      if (author && author !== username && author !== '[deleted]') return false;
      if (comment.removed_by_category) return true;
      const text = comment.body || comment.comment || '';
      return text === '[removed]' || text === '[deleted]' || text.includes('[removed]') || text.includes('[deleted]');
    };
    
    const isRemovedPost = (post) => {
      if (post.removed_by_category) return true;
      const text = post.selftext || post.post || '';
      return text === '[removed]' || text === '[deleted]' || text.includes('[removed]') || text.includes('[deleted]');
    };
    
    return allComments.some(isRemovedComment) || allPosts.some(isRemovedPost);
  }, [userData]);

  // Handle focus mode clicks
  useEffect(() => {
    const handleCellClick = async (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      
      // Check if click was on the ::after pseudo-element area (top-right corner)
      const rect = cell.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Icon is at top: 12px, right: 12px, size: 20x20
      if (x >= rect.width - 32 && x <= rect.width - 12 && y >= 12 && y <= 32) {
        e.stopPropagation();
        
        // Use html2canvas to capture the widget including SVGs
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(cell, {
          backgroundColor: null,
          scale: 4,
          logging: false,
          useCORS: true,
        });
        
        const imageData = canvas.toDataURL('image/png');
        setFocusedWidget({ imageData, rect });
      }
    };

    document.addEventListener('click', handleCellClick);
    return () => document.removeEventListener('click', handleCellClick);
  }, []);

  useEffect(() => {
    // Resolve API base once at startup - userData is set when user searches
    (async () => {
      try {
        const base = await resolveApiBase();
        setApiBase(base);
      } catch (e) {
        console.error('Failed to resolve API base', e);
      }
    })();
  }, []);

  // DISABLED: Age/Gender ML model prediction
  // useEffect(() => {
  //   if (!userData) return;
  //   if (!ageGenderPredictions && !ageGenderLoading && userData?.comments?.length) {
  //     const MAX_COMMENTS = 300;
  //     const texts = userData.comments
  //       .filter(c => c?.comment && c.comment.trim().length >= 10)
  //       .slice(0, MAX_COMMENTS)
  //       .map(c => ({
  //         text: c.comment,
  //         type: 'comment',
  //         subreddit: c.subreddit,
  //         timestamp: c.timestamp
  //       }));
  //     if (texts.length === 0) return;
  //     setAgeGenderLoading(true);
  //     apiPost('/predict-age-gender', { texts }, { attempts: 3, baseDelay: 600 })
  //       .then(json => setAgeGenderPredictions(json.predictions || []))
  //       .catch(err => {
  //         console.error('Age/Gender prediction error', err);
  //         setAgeGenderError(err.message || 'Failed to fetch');
  //       })
  //       .finally(() => setAgeGenderLoading(false));
  //   }
  // }, [userData]);

  const checkGrammar = async () => {
    if (!userData) return;
    setGrammarLoading(true);
    try {
      const allComments = userData.comments || [];
      const allPosts = userData.posts || [];
      const detectLanguage = (text) => {
        if (!text || text.length < 10) return 'und';
        try {
          const langCode = franc(text);
          if (langCode === 'und') {
            const asciiRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
            if (asciiRatio > 0.7) return 'eng';
            return 'und';
          }
          return langCode;
        } catch { return 'eng'; }
      };
      const MAX_CHARS = 15000;
      const englishItems = [];
      let totalChars = 0;
      for (const comment of allComments) {
        const text = comment.comment || comment.body || '';
        if (text.length > 10 && detectLanguage(text) === 'eng' && totalChars + text.length <= MAX_CHARS) {
          englishItems.push({
            text, timestamp: comment.timestamp || comment.created_utc,
            type: 'comment', subreddit: comment.subreddit || 'unknown',
            karma: comment.karma || 0, url: comment.url || ''
          });
          totalChars += text.length;
        }
      }
      for (const post of allPosts) {
        const text = post.title || '';
        if (text.length > 10 && detectLanguage(text) === 'eng' && totalChars + text.length <= MAX_CHARS) {
          englishItems.push({
            text, timestamp: post.timestamp || post.created_utc,
            type: 'post', subreddit: post.subreddit || 'unknown',
            karma: post.score || 0, url: post.url || ''
          });
          totalChars += text.length;
        }
      }
      if (englishItems.length === 0) {
        setGrammarMistakes([]);
        setGrammarChecked(true);
        return;
      }
      const responseData = await apiPost('/grammar-check', { texts: englishItems, language: 'eng' }, { attempts: 3, baseDelay: 600 });
      setGrammarMistakes(responseData.mistakes || []);
      setGrammarChecked(true);
    } catch (error) {
      console.error('Error checking grammar:', error);
      setGrammarMistakes([]);
      setGrammarChecked(true);
    } finally {
      setGrammarLoading(false);
    }
  };

  useEffect(() => {
    const hasData = userData && ((userData.comments?.length > 0) || (userData.posts?.length > 0));
    if (hasData) {
      setGrammarChecked(false);
      setGrammarLoading(false);
      grammarCheckStarted.current = false;
      const timer = setTimeout(() => {
        if (!grammarCheckStarted.current) {
          grammarCheckStarted.current = true;
          checkGrammar();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  // Calculate activity data for WorldMap
  const calculateHourlyActivity = () => {
    if (!userData) return [];
    const hourCounts = Array(24).fill(0);
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const hour = new Date(timestamp * 1000).getHours();
        hourCounts[hour]++;
      }
    });
    return hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    }));
  };

  const activityByHour = calculateHourlyActivity();

  const findPeakActivityWindow = (data) => {
    if (!data || data.length === 0) {
      return { start: 0, end: 3, peak: 0, startFormatted: '00:00', endFormatted: '03:00' };
    }
    let maxSum = 0, peakStart = 0;
    for (let i = 0; i <= data.length - 3; i++) {
      const sum = data.slice(i, i + 3).reduce((acc, h) => acc + (h.count || 0), 0);
      if (sum > maxSum) { maxSum = sum; peakStart = i; }
    }
    const startHour = data[peakStart].hour;
    const endHour = data[Math.min(peakStart + 2, data.length - 1)].hour;
    const parseHour = (h) => typeof h === 'number' ? h : parseInt(h.split(':')[0], 10);
    return {
      start: parseHour(startHour), end: parseHour(endHour),
      peak: parseHour(data[peakStart + 1]?.hour || startHour),
      startFormatted: startHour, endFormatted: endHour
    };
  };

  const peakWindow = findPeakActivityWindow(activityByHour);

  // Calculate activity by weekday, day of month, and month for BotDetection
  const activityByWeekday = (() => {
    if (!userData) return [];
    const weekdayCounts = Array(7).fill(0);
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const day = new Date(timestamp * 1000).getDay();
        weekdayCounts[day]++;
      }
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdayCounts.map((count, idx) => ({ day: dayNames[idx], count }));
  })();

  const activityByDayOfMonth = (() => {
    if (!userData) return [];
    const dayCounts = Array(31).fill(0);
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const day = new Date(timestamp * 1000).getDate();
        dayCounts[day - 1]++;
      }
    });
    return dayCounts.map((count, idx) => ({ day: idx + 1, count }));
  })();

  const activityByMonth = (() => {
    if (!userData) return [];
    const monthCounts = {};
    const allItems = [...(userData.comments || []), ...(userData.posts || [])];
    allItems.forEach(item => {
      const timestamp = item.timestamp || item.created_utc;
      if (timestamp) {
        const date = new Date(timestamp * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  })();

  // Calculate PCA data for BotDetection
  // Compute actual text features instead of random data
  const pcaData = useMemo(() => {
    const allItems = [...(userData?.comments || []), ...(userData?.posts || [])];
    if (allItems.length < 10) return null;
    
    // Compute simple text features for each item
    const items = allItems.slice(0, 200);
    const features = items.map(item => {
      const text = item.body || item.selftext || item.title || '';
      if (!text || text.length < 10) return null;
      
      // Feature 1: Average word length
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const avgWordLen = words.length > 0 ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;
      
      // Feature 2: Punctuation density
      const punctCount = (text.match(/[.,!?;:]/g) || []).length;
      const punctDensity = text.length > 0 ? punctCount / text.length * 100 : 0;
      
      // Feature 3: Capital letter ratio
      const capCount = (text.match(/[A-Z]/g) || []).length;
      const capRatio = text.length > 0 ? capCount / text.length * 100 : 0;
      
      // Feature 4: Sentence length (words per sentence)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgSentenceLen = sentences.length > 0 ? words.length / sentences.length : words.length;
      
      return { avgWordLen, punctDensity, capRatio, avgSentenceLen };
    }).filter(f => f !== null);
    
    if (features.length < 10) return null;
    
    // Normalize and create 2D projection (simple: use avgWordLen and punctDensity)
    const minWordLen = Math.min(...features.map(f => f.avgWordLen));
    const maxWordLen = Math.max(...features.map(f => f.avgWordLen));
    const minPunct = Math.min(...features.map(f => f.punctDensity));
    const maxPunct = Math.max(...features.map(f => f.punctDensity));
    
    return features.map(f => ({
      x: maxWordLen > minWordLen ? ((f.avgWordLen - minWordLen) / (maxWordLen - minWordLen) - 0.5) * 6 : 0,
      y: maxPunct > minPunct ? ((f.punctDensity - minPunct) / (maxPunct - minPunct) - 0.5) * 6 : 0
    }));
  }, [userData]);

  // Helper function to check if widget should be displayed
  const shouldShowWidget = (widgetName) => {
    if (!userData) return false;
    
    const comments = userData.comments || [];
    const posts = userData.posts || [];
    const allItems = [...comments, ...posts];
    const username = (userData?.username || userData?.account_info?.username || userData?.about?.name || '').toLowerCase();
    
    switch (widgetName) {
      case 'TotalComments':
        return true; // Always show, even when 0
      case 'TotalPosts':
        return true; // Always show, even when 0
      case 'TopEmojis':
        return allItems.some(item => {
          const text = item.comment || item.body || item.post || item.title || '';
          return /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/u.test(text);
        });
      case 'LongestCapsSentence':
        return allItems.some(item => {
          const text = item.comment || item.body || item.post || item.title || '';
          return /[A-Z]{5,}/.test(text);
        });
      case 'FavoriteNumber':
        return allItems.some(item => {
          const text = item.comment || item.body || item.post || item.title || '';
          return /\d/.test(text);
        });
      case 'TopWords':
      case 'TopWordsOverTime':
        // Check if there's meaningful text content to analyze
        const hasText = allItems.some(item => {
          const text = item.comment || item.body || item.title || item.selftext || '';
          return text.trim().length > 0;
        });
        return allItems.length >= 5 && hasText;
      case 'EditFrequency':
      case 'EditTiming':
        return allItems.some(item => item.edited && typeof item.edited === 'number');
      case 'RemovedCommentsOverTime':
      case 'RemovedCommentsBySubreddit':
        return comments.some(c => c.removed === true);
      case 'TopLocations':
      case 'WorldMap':
        // Check if there are any location mentions or activity data
        return allItems.length >= 10;
      case 'PronounUsage':
      case 'PronounPersonality':
        return allItems.length >= 5;
      case 'ReplyPatterns':
        return comments.some(c => c.parent_id && c.parent_id !== c.link_id);
      case 'TSNEClustering':
      case 'PCAAnalysis':
        return allItems.length >= 20;
      case 'LanguageDetection':
        return allItems.length >= 10;
      default:
        // By default, show widget if there's any data
        return allItems.length > 0;
    }
  };

  if (!userData) {
    return (
      <div className="app-container" style={{ 
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '24px',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <AnimatedGridPattern 
            numSquares={30}
            maxOpacity={0.3}
            duration={3}
            repeatDelay={1}
            strokeColor="#ff6b6b"
            fillColor="#ff6b6b"
            width={60}
            height={60}
          />
        </div>
        
        {/* Compact Search Card */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h1 style={{ 
            color: '#ffffff', 
            margin: '0 0 12px 0',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <img src="/reddituser-logo.svg" alt="RedditUser.info Logo" style={{ width: '32px', height: '32px' }} />
            <HackerText text="REDDITUSER.INFO" duration={2000} style={{ fontFamily: 'monospace', letterSpacing: '0' }} />
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            margin: '0 0 32px 0',
            fontSize: '15px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            What does your reddit profile reveal about you?
          </p>
          
          <SearchBox 
            userData={userData}
            onUserDataChange={setUserData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            initialUsername={urlUsername}
            autoSearch={!!urlUsername}
            className="no-enlarge"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* Animated Background (same as landing) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <AnimatedGridPattern 
          numSquares={30}
          maxOpacity={0.15}
          duration={3}
          repeatDelay={1}
          strokeColor="#ff6b6b"
          fillColor="#ff6b6b"
          width={60}
          height={60}
        />
      </div>

      {/* Logo top-left */}
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); setUserData(null); window.history.pushState({}, '', '/'); }}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: '700',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
      >
        <img src="/reddituser-logo.svg" alt="Logo" style={{ width: '32px', height: '32px' }} />
      </a>

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '250px minmax(0, 1fr)',
        gap: 'var(--grid-gap)',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '48px',
      }}>
        {/* Column 1: Sidebar */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--grid-gap)',
          position: 'sticky',
          top: '16px',
          alignSelf: 'start',
          height: 'fit-content'
        }}>
          {/* PFP + Support & Extension Widget */}
          <div className="cell no-enlarge" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px'
          }}>
            {(() => {
              const about = userData?.about || userData?.account_info || {};
              const avatarUrl = about.icon_img || about.snoovatar_img || 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png';
              const displayName = userData?.username || about.name || '';
              return displayName ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: '3px solid rgba(255, 107, 107, 0.5)',
                      objectFit: 'cover',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    onError={(e) => { e.target.src = 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png'; }}
                  />
                  <a
                    href={`https://reddit.com/user/${displayName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ffffff'}
                  >
                    u/{displayName}
                  </a>
                </div>
              ) : null;
            })()}
            <p className="stat-meta" style={{ textAlign: 'center', margin: 0 }}>
              Help me pay for proxies to keep this service running
            </p>
            <a 
              href="https://buymeacoffee.com/floridomeacci" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                background: '#2a2a2a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                border: 'none',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ marginRight: '8px' }}>☕</span>
              Buy me a coffee
            </a>
            
            <p className="stat-meta" style={{ textAlign: 'center', margin: '8px 0 0 0' }}>
              Get our Chrome extension
            </p>
            <a 
              href="https://chromewebstore.google.com/detail/ijdpmpcnfipbnpajhffphpfgimbkccea?utm_source=item-share-cb" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                background: '#2a2a2a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                border: 'none',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ marginRight: '8px' }}>🧩</span>
              Install Extension
            </a>
            
            <p className="stat-meta" style={{ textAlign: 'center', margin: '8px 0 0 0' }}>
              Need help or have feedback?
            </p>
            <button 
              data-contact-support
              onClick={() => setShowSupportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                background: '#2a2a2a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                border: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ marginRight: '8px' }}>💬</span>
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Columns 2-5: Main content grid */}
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gridAutoRows: '175px',
          gridAutoFlow: 'dense',
          gap: 'var(--grid-gap)',
          minWidth: 0,
        }}>

        {/* Row 1: Stats */}
        <AccountAge userData={userData} style={getSize('AccountAge')} className="no-enlarge" />
        <TotalKarma userData={userData} style={getSize('TotalKarma')} className="no-enlarge" />
        {shouldShowWidget('TotalComments') && <TotalComments userData={userData} style={getSize('TotalComments')} className="no-enlarge" />}
        {shouldShowWidget('TotalPosts') && <TotalPosts userData={userData} style={getSize('TotalPosts')} className="no-enlarge" />}
        
        {/* Row 2: Top Subreddits (1x2) | Content Search (2x2 starts here) | Media Gallery (1x2) */}
        <TopSubredditsTreemap 
          userData={userData}
          highlightedSubIndex={highlightedSubIndex}
          setHighlightedSubIndex={setHighlightedSubIndex}
          style={getSize('TopSubredditsTreemap')}
        />
        <ContentSearch 
          comments={userData?.comments || []}
          posts={userData?.posts || []}
          style={getSize('ContentSearch')}
        />
        <RecentActivity userData={userData} style={getSize('RecentActivity')} />
        {shouldShowWidget('LifetimeActivity') && (
          <LifetimeActivity userData={userData} style={getSize('LifetimeActivity')} />
        )}
        
        {/* AI-Powered Personal Insights */}
        <FamilyTree userData={userData} style={getSize('FamilyTree')} />
        <FriendsNetwork userData={userData} style={getSize('FriendsNetwork')} />
        <RelationshipStatus userData={userData} style={getSize('RelationshipStatus')} />
        <ProfessionAnalysis userData={userData} style={getSize('ProfessionAnalysis')} />
        
        {/* Row 3: Top Subreddits (1x1) | (Personality continues) | Removed Comments (1x1) */}
        <ActivityByMonth userData={userData} style={getSize('ActivityByMonth')} />
        <ActivityHeatmap userData={userData} style={getSize('ActivityHeatmap')} />
        
        {/* Activity Patterns */}
        <EngagementLeaderboard userData={userData} style={getSize('EngagementLeaderboard')} />
        <ActivityByDayOfMonth userData={userData} style={getSize('ActivityByDayOfMonth')} />
        <ActivityByWeekday userData={userData} style={getSize('ActivityByWeekday')} />
        <HourlyPulse userData={userData} style={getSize('HourlyPulse')} />
        <KarmaMomentum userData={userData} style={getSize('KarmaMomentum')} />
        
        {/* Content Analysis */}
        {shouldShowWidget('TopEmojis') && <TopEmojis userData={userData} style={getSize('TopEmojis')} />}
        
        {/* Row: LengthVsKarma (2×2) + FavoriteNumber (1×2) + TopWords (2×2) + SubredditBreakdown (1×3 spanning 3 rows) */}
        <LengthVsKarma userData={userData} style={getSize('LengthVsKarma')} />
        <KarmaSplitByMonth userData={userData} style={getSize('KarmaSplitByMonth')} />
        {shouldShowWidget('TopWords') && <TopWords userData={userData} style={getSize('TopWords')} />}
        {shouldShowWidget('TopWordsOverTime') && <TopWordsOverTime userData={userData} style={getSize('TopWordsOverTime')} />}
        <SubredditBreakdown 
          userData={userData}
          highlightedSubIndex={highlightedSubIndex}
          setHighlightedSubIndex={setHighlightedSubIndex}
          style={getSize('SubredditBreakdown')}
        />
        
        {/* Row: QuestionsVsCommentary (2×1) + LongestCapsSentence (1×1) */}
        <QuestionsVsCommentary userData={userData} style={getSize('QuestionsVsCommentary')} />
        {shouldShowWidget('LongestCapsSentence') && <LongestCapsSentence userData={userData} style={getSize('LongestCapsSentence')} />}
        {shouldShowWidget('FavoriteNumber') && <FavoriteNumber userData={userData} style={getSize('FavoriteNumber')} />}
        
        {/* Top/Worst Content - Combined full-width widget */}
        <TopWorstContent userData={userData} style={getSize('TopWorstContent')} />
        
        {/* Distributions */}
        <KarmaDistribution userData={userData} style={getSize('KarmaDistribution')} />
        <CommentLengthDist userData={userData} style={getSize('CommentLengthDist')} />
        
        {/* Flow & Network */}
        {/* DISABLED: Sentiment ML model */}
        {/* <WeeklySentiment userData={userData} style={getSize('WeeklySentiment')} /> */}
        <CommentFlow userData={userData} style={getSize('CommentFlow')} />
        <SubredditFlow userData={userData} style={getSize('SubredditFlow')} />
        
        {/* Large Visualizations */}
        <SubredditActivityOverTime userData={userData} style={getSize('SubredditActivityOverTime')} />
        
        {/* Row: BotDetection (2x2) + TopLocationsWidget (2x2) */}
        <BotDetection 
          userData={userData}
          pcaData={pcaData}
          activityByHour={activityByHour}
          activityByWeekday={activityByWeekday}
          activityByDayOfMonth={activityByDayOfMonth}
          activityByMonth={activityByMonth}
          locationConfidence={locationConfidence}
          style={getSize('BotDetection')}
        />
        <TopLocationsWidget 
          userData={userData} 
          highlightedCountries={highlightedCountries}
          style={getSize('TopLocationsWidget')} 
        />
        <LocationAnalysis userData={userData} onLocationData={setAiLocationData} style={getSize('LocationAnalysis')} />
        <IdentifiableImages userData={userData} style={getSize('IdentifiableImages')} />
        
        {/* Row: WorldMap */}
        <WorldMapWidget 
          userData={userData}
          activityByHour={activityByHour}
          peakWindow={peakWindow}
          aiLocation={aiLocationData}
          onHighlightedCountriesChange={setHighlightedCountries}
          onConfidenceChange={(confidence) => {
            console.log('App received locationConfidence:', confidence);
            setLocationConfidence(prev => {
              const keys = ['location', 'timezone', 'language', 'mismatchPercent'];
              const unchanged = prev && keys.every(key => prev[key] === confidence?.[key]);
              return unchanged ? prev : confidence;
            });
          }}
          style={getSize('WorldMapWidget')}
        />
        
        {/* DISABLED: Age/Gender ML model */}
        {/* <GenderTimeline 
          userData={userData}
          ageGenderPredictions={ageGenderPredictions}
          ageGenderLoading={ageGenderLoading}
          style={getSize('GenderTimeline')}
        /> */}
        
        {/* DISABLED: Age/Gender ML model */}
        {/* <AgeTimeline 
          userData={userData}
          ageGenderPredictions={ageGenderPredictions}
          ageGenderLoading={ageGenderLoading}
          style={getSize('AgeTimeline')}
        /> */}
        
        {/* Literacy at bottom */}
        {/* <GrammarMistakesWidget 
          grammarMistakes={grammarMistakes}
          grammarLoading={grammarLoading}
          style={getSize('GrammarMistakesWidget')}
        /> */}
        <LongestStreak userData={userData} style={getSize('LongestStreak')} />
        <VocabularyWidget userData={userData} style={getSize('VocabularyWidget')} />
        
        {/* Combined Subreddit Activity Widget */}
        <SubredditActivityWidget userData={userData} style={getSize('InterestWidget')} />
        
        {/* Removed Comments Analysis - only show if user has removed content */}
        {hasRemovedContent && shouldShowWidget('RemovedCommentsOverTime') && (
          <>
            <RemovedCommentsOverTime userData={userData} style={getSize('RemovedCommentsOverTime')} />
            <RemovedCommentsBySubreddit userData={userData} style={getSize('RemovedCommentsBySubreddit')} />
          </>
        )}
        
        {/* Pronoun Usage Analysis */}
        {shouldShowWidget('PronounUsage') && <PronounUsage userData={userData} style={getSize('PronounUsage')} />}
        {shouldShowWidget('PronounPersonality') && <PronounPersonality userData={userData} style={getSize('PronounPersonality')} />}
        
        {/* Reply Patterns */}
        {shouldShowWidget('ReplyPatterns') && <ReplyPatterns userData={userData} style={getSize('ReplyPatterns')} />}
        
        {/* Clustering Analysis - Bottom */}
        {shouldShowWidget('TSNEClustering') && <TSNEClustering userData={userData} style={getSize('TSNEClustering')} />}
        {shouldShowWidget('PCAAnalysis') && <PCAAnalysis userData={userData} style={getSize('PCAAnalysis')} />}
        {shouldShowWidget('LanguageDetection') && <LanguageDetection userData={userData} style={getSize('LanguageDetection')} />}
        
        {/* Edit Behavior Analysis */}
        {shouldShowWidget('EditFrequency') && <EditFrequency userData={userData} style={getSize('EditFrequency')} />}
        {shouldShowWidget('EditTiming') && <EditTiming userData={userData} style={getSize('EditTiming')} />}
        
        {/* Divider: How You Compare */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 0',
          marginTop: '8px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,107,107,0.3), rgba(255,107,107,0.3))' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', whiteSpace: 'nowrap' }}>How You Compare</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,107,107,0.3), rgba(255,107,107,0.3), transparent)' }} />
        </div>

        {/* Comparison Widgets */}
        <RedditPersonality userData={userData} globalStats={globalStats} style={getSize('RedditPersonality')} />
        <KarmaEfficiency userData={userData} globalStats={globalStats} style={getSize('KarmaEfficiency')} />
        <ActivityFrequency userData={userData} globalStats={globalStats} style={getSize('ActivityFrequency')} />
        <VocabularyLevel userData={userData} globalStats={globalStats} style={getSize('VocabularyLevel')} />
        <NightOwlScore userData={userData} globalStats={globalStats} style={getSize('NightOwlScore')} />
        <PostCommentRatio userData={userData} style={getSize('PostCommentRatio')} />
        <WeekendWarrior userData={userData} globalStats={globalStats} style={getSize('WeekendWarrior')} />
        <SubredditDiversity userData={userData} globalStats={globalStats} style={getSize('SubredditDiversity')} />
        <ControversyIndex userData={userData} globalStats={globalStats} style={getSize('ControversyIndex')} />
        <CommentLengthComparison userData={userData} globalStats={globalStats} style={getSize('CommentLengthComparison')} />
        <KarmaOverTime userData={userData} globalStats={globalStats} style={getSize('KarmaOverTime')} />
        <HourlyActivityComparison userData={userData} globalStats={globalStats} style={getSize('HourlyActivityComparison')} />
        
        </div>
      </div>
      
      {/* Focus Mode Overlay */}
      {focusedWidget && createPortal(
        <div 
          className="focus-overlay" 
          onClick={() => setFocusedWidget(null)}
        >
          <div 
            className="focus-widget-container"
            style={{
              width: focusedWidget.rect.width,
              height: focusedWidget.rect.height,
              transform: focusedWidget.rect.width > 600 ? 'scale(1.2)' : 'scale(2)',
              transformOrigin: 'center center',
            }}
          >
            <img 
              src={focusedWidget.imageData} 
              alt="Focused widget"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>,
        document.body
      )}
      
      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}
      
      {/* Terms Modal */}
      {showTermsModal && (
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      )}
      
      {/* Cookie Consent Banner */}
      <CookieConsent onTermsClick={() => setShowTermsModal(true)} />
    </div>
  );
}

export default App;
