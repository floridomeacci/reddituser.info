import { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../design-tokens';

// Same location list as TopLocations component for consistency
const KNOWN_LOCATIONS = [
  'United States', 'USA', 'America', 'Canada', 'Mexico', 'Brazil', 'Argentina',
  'United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Ireland', 'France',
  'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Poland', 'Czech Republic', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Russia', 'Ukraine', 'Greece', 'Turkey', 'Israel', 'Egypt', 'South Africa',
  'India', 'China', 'Japan', 'South Korea', 'Korea', 'Taiwan', 'Thailand',
  'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Australia',
  'New Zealand', 'Saudi Arabia', 'UAE', 'Dubai', 'Pakistan', 'Bangladesh',
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco',
  'Seattle', 'Boston', 'Miami', 'Denver', 'Atlanta', 'Dallas', 'Austin', 'Portland',
  'Toronto', 'Vancouver', 'Montreal', 'London', 'Paris', 'Berlin', 'Munich',
  'Amsterdam', 'Brussels', 'Madrid', 'Barcelona', 'Rome', 'Milan', 'Vienna',
  'Prague', 'Warsaw', 'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Dublin',
  'Moscow', 'Tokyo', 'Osaka', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong',
  'Singapore', 'Bangkok', 'Sydney', 'Melbourne', 'Auckland', 'Mumbai', 'Delhi',
  'Bangalore', 'Tel Aviv', 'Cairo', 'Cape Town', 'Lagos', 'Nairobi',
  'California', 'Texas', 'Florida', 'Illinois', 'Pennsylvania',
  'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
  'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
  'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
  'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Nevada',
  'Iowa', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska', 'Hawaii',
  'Idaho', 'West Virginia', 'Maine', 'Montana', 'Rhode Island', 'Delaware',
  'South Dakota', 'North Dakota', 'Alaska', 'Vermont', 'Wyoming',
  'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Middle East',
  'Southeast Asia', 'East Asia', 'Western Europe', 'Eastern Europe', 'Scandinavia',
  'Pacific Northwest', 'Midwest', 'East Coast', 'West Coast', 'Bay Area', 'Silicon Valley'
];

// Living/residence indicator patterns
const LIVING_PATTERNS = [
  /\bi\s+(live|reside|stay|am\s+based|am\s+from|am\s+in|moved\s+to|relocated\s+to|grew\s+up\s+in|was\s+born\s+in|was\s+raised\s+in)\b/i,
  /\b(my\s+(city|town|area|neighborhood|state|country|region|home))\b/i,
  /\b(here\s+in|over\s+here\s+in|where\s+i\s+live|where\s+i'm\s+from|living\s+in|based\s+in|born\s+in|raised\s+in|moved\s+to|relocated\s+to)\b/i,
  /\b(local|hometown|home\s+state|home\s+country)\b/i,
  /\b(currently\s+in|currently\s+living|currently\s+based)\b/i,
  /\b(back\s+home\s+in|back\s+in)\b/i,
];

export default function LocationAnalysis({ userData, style = {} }) {
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Find location words in content, then extract sentences containing them
  const locationSentences = useMemo(() => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
      return [];
    }

    const allItems = [
      ...(userData.comments || []).map(c => ({ text: c.body || c.comment || '', sub: c.subreddit })),
      ...(userData.posts || []).map(p => ({ text: `${p.title || ''} ${p.selftext || ''}`, sub: p.subreddit }))
    ];

    // Also try NER entities from items
    const nerLocations = new Set();
    [...(userData.comments || []), ...(userData.posts || [])].forEach(item => {
      if (item.entities?.locations) {
        item.entities.locations.forEach(loc => {
          if (loc.text && loc.text.length > 4) nerLocations.add(loc.text);
        });
      }
    });

    // Build regex patterns for all known locations + NER locations
    const allLocationWords = [...new Set([
      ...KNOWN_LOCATIONS,
      ...Array.from(nerLocations)
    ])];

    const sentences = [];
    const seen = new Set();

    allItems.forEach(({ text, sub }) => {
      if (!text || text.length < 10) return;

      // Split into sentences
      const rawSentences = text.split(/(?<=[.!?])\s+|[\n\r]+/).filter(s => s.length > 15);

      rawSentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length < 15 || trimmed.length > 500) return;

        // Check if sentence contains any location word
        let matchedLocation = null;
        for (const loc of allLocationWords) {
          const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(trimmed)) {
            matchedLocation = loc;
            break;
          }
        }

        if (matchedLocation) {
          // Prioritize sentences with living/residence indicators
          const hasLivingIndicator = LIVING_PATTERNS.some(p => p.test(trimmed));
          const key = trimmed.substring(0, 80).toLowerCase();

          if (!seen.has(key)) {
            seen.add(key);
            sentences.push({
              text: trimmed,
              location: matchedLocation,
              subreddit: sub,
              priority: hasLivingIndicator ? 1 : 0
            });
          }
        }
      });
    });

    // Sort: living indicators first, then by length (shorter = more direct)
    sentences.sort((a, b) => b.priority - a.priority || a.text.length - b.text.length);

    return sentences.slice(0, 40); // Top 40 most relevant
  }, [userData]);

  // Step 2: Send to AI for analysis
  useEffect(() => {
    if (locationSentences.length === 0) return;

    const queryAI = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = userData?.username || `session_${Date.now()}`;

        // Build context with subreddit info
        const contextLines = locationSentences.map(s =>
          `[r/${s.subreddit || '?'}] ${s.text}`
        ).join('\n');

        const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Analyze these Reddit sentences to determine where this person most likely lives. Look for direct statements like "I live in..." or "here in..." and indirect clues like local subreddits, regional slang, weather references, and local knowledge. Return JSON: {"likelyLocation": {"city": "name or null", "state": "name or null", "country": "name", "confidence": "high/medium/low"}, "evidence": [{"text": "key quote", "type": "direct/indirect"}], "alternateLocations": [{"place": "name", "reason": "why"}], "summary": "One sentence about where they likely live"}. Sentences:\n${contextLines}`,
            sessionId: sessionId
          })
        });

        if (!response.ok) throw new Error('AI query failed');

        const raw = await response.json();
        let parsed = raw;
        if (Array.isArray(raw) && raw[0]?.output) {
          try { parsed = JSON.parse(raw[0].output); } catch (e) { parsed = raw[0].output; }
        } else if (typeof raw === 'string') {
          try { parsed = JSON.parse(raw); } catch (e) { /* keep as-is */ }
        }
        setLocationData(parsed);
      } catch (err) {
        setError(err.message);
        console.error('Location Analysis AI error:', err);
      } finally {
        setLoading(false);
      }
    };

    queryAI();
  }, [locationSentences, userData]);

  // Confidence color
  const getConfidenceColor = (conf) => {
    if (!conf) return COLORS.TEXT_MUTED;
    const c = conf.toLowerCase();
    if (c === 'high') return '#4ade80';
    if (c === 'medium') return '#fbbf24';
    return '#f97316';
  };

  // Confidence icon
  const getConfidenceIcon = (conf) => {
    if (!conf) return '❓';
    const c = conf.toLowerCase();
    if (c === 'high') return '🎯';
    if (c === 'medium') return '📍';
    return '🔍';
  };

  // Build display location string
  const getLocationString = (loc) => {
    if (!loc) return 'Unknown';
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
    return (
      <div className="cell" style={style}>
        <h3>📍 Where They Live</h3>
        <p className="stat-meta">No data available</p>
      </div>
    );
  }

  if (locationSentences.length === 0) {
    return (
      <div className="cell" style={style}>
        <h3>📍 Where They Live</h3>
        <p className="stat-meta">AI-powered location analysis</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: COLORS.TEXT_MUTED, fontSize: '11px' }}>
          No location mentions found
        </div>
      </div>
    );
  }

  return (
    <div className="cell" style={style}>
      <h3>📍 Where They Live</h3>
      <p className="stat-meta">
        {loading && '⏳ AI analyzing location clues...'}
        {error && `❌ ${error}`}
        {!loading && !error && locationData && `${locationSentences.length} clues analyzed`}
        {!loading && !error && !locationData && `${locationSentences.length} location mentions found`}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: '11px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: COLORS.TEXT_MUTED }}>
            <div style={{ fontSize: '24px' }}>🌍</div>
            <div>Analyzing {locationSentences.length} location clues...</div>
          </div>
        ) : locationData && typeof locationData === 'object' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Main location result */}
            {locationData.likelyLocation && (
              <div style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '8px',
                borderLeft: `3px solid ${getConfidenceColor(locationData.likelyLocation.confidence)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {getConfidenceIcon(locationData.likelyLocation.confidence)}
                  </span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: COLORS.TEXT_WHITE,
                    letterSpacing: '-0.02em'
                  }}>
                    {getLocationString(locationData.likelyLocation)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '10px'
                }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${getConfidenceColor(locationData.likelyLocation.confidence)}22`,
                    color: getConfidenceColor(locationData.likelyLocation.confidence),
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {locationData.likelyLocation.confidence || 'unknown'} confidence
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            {locationData.summary && (
              <div style={{
                fontSize: '11px',
                color: COLORS.TEXT_SECONDARY,
                lineHeight: '1.4',
                padding: '0 4px'
              }}>
                {locationData.summary}
              </div>
            )}

            {/* Evidence */}
            {locationData.evidence && locationData.evidence.length > 0 && (
              <div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: COLORS.TEXT_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}>
                  Evidence
                </div>
                {locationData.evidence.slice(0, 5).map((ev, i) => (
                  <div key={i} style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      padding: '1px 4px',
                      borderRadius: '3px',
                      background: ev.type === 'direct' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
                      color: ev.type === 'direct' ? '#4ade80' : '#fbbf24',
                      fontSize: '8px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      {ev.type || 'clue'}
                    </span>
                    <span style={{ color: COLORS.TEXT_SECONDARY, lineHeight: '1.3' }}>
                      "{ev.text}"
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Alternate locations */}
            {locationData.alternateLocations && locationData.alternateLocations.length > 0 && (
              <div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: COLORS.TEXT_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  Also possible
                </div>
                {locationData.alternateLocations.slice(0, 3).map((alt, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 0',
                    fontSize: '10px'
                  }}>
                    <span style={{ color: COLORS.TEXT_WHITE }}>• {alt.place}</span>
                    <span style={{ color: COLORS.TEXT_MUTED }}>— {alt.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : locationData ? (
          // Fallback: AI returned a string
          <div style={{ color: COLORS.TEXT_SECONDARY, lineHeight: '1.4', padding: '8px' }}>
            {String(locationData)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
