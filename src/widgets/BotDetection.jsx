import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../design-tokens';
import { INTEREST_CATEGORIES, LEISURE_CATEGORIES, NSFW_CATEGORIES } from '../data/subredditCategories';

// Helper function to calculate account age in days
const calculateAccountAgeDays = (createdDate) => {
  if (!createdDate) return 0;
  const created = new Date(createdDate);
  const now = new Date();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
};

export default function BotDetection({ userData, pcaData, activityByHour, activityByWeekday, activityByDayOfMonth, activityByMonth, locationConfidence, style = {} }) {
  if (!userData || (!userData.comments?.length && !userData.posts?.length)) return null;
  
  console.log('BotDetection received locationConfidence:', locationConfidence);
  
  const botScore = useMemo(() => {
    const pillars = {
      pcaData: { score: 0, label: 'Writing Fingerprint', human: 0, bot: 0 },
      locationMismatch: { score: 0, label: 'Location Consistency', human: 0, bot: 0 },
      activityByMonth: { score: 0, label: 'Monthly Patterns', human: 0, bot: 0 },
      activityByWeekday: { score: 0, label: 'Weekday Behavior', human: 0, bot: 0 },
      sleepPattern: { score: 0, label: 'Sleep Pattern', human: 0, bot: 0 },
      subredditHotspots: { score: 0, label: 'Subreddit Focus', human: 0, bot: 0 }
    };

    // 1. PCA Data Analysis - Writing Fingerprint
    // The PCA/t-SNE widgets show "Cluster Tightness" as a HUMAN indicator
    // 75% cluster tightness = 75% human-like = 25% bot risk
    // We need to INVERT: bot risk = 100 - cluster tightness
    if (pcaData && pcaData.length > 10) {
      const xValues = pcaData.map(d => d.x);
      const yValues = pcaData.map(d => d.y);
      
      // Calculate standard deviation to measure spread
      const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
      const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
      const xStd = Math.sqrt(xValues.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) / xValues.length);
      const yStd = Math.sqrt(yValues.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / yValues.length);
      
      // Calculate coefficient of variation (CV) - normalized measure of spread
      // Lower CV = tighter cluster = more consistent writing = more HUMAN-like
      const avgStd = (xStd + yStd) / 2;
      const overallMean = (Math.abs(xMean) + Math.abs(yMean)) / 2 || 1;
      const cv = avgStd / Math.max(overallMean, 0.1);
      
      // Calculate average distance from center
      const avgDistFromCenter = pcaData.reduce((sum, d) => {
        return sum + Math.sqrt(Math.pow(d.x - xMean, 2) + Math.pow(d.y - yMean, 2));
      }, 0) / pcaData.length;
      
      // Normalized distance (data is typically scaled to -3 to 3 range)
      const maxPossibleDist = 3; // sqrt(3^2 + 3^2) / 2 ≈ 2.12, but we use 3 for margin
      const normalizedDist = Math.min(avgDistFromCenter / maxPossibleDist, 1);
      
      // Cluster tightness = how HUMAN the writing is (tight = consistent = human)
      // normalizedDist close to 0 = very tight = human-like
      // normalizedDist close to 1 = spread out = varied/suspicious
      const humanLikeScore = Math.round((1 - normalizedDist) * 100);
      
      // BOT RISK = inverse of human-like score
      // 75% human-like = 25% bot risk
      const botRisk = 100 - humanLikeScore;
      
      console.log('🔍 WRITING FINGERPRINT:', {
        dataPoints: pcaData.length,
        avgDistFromCenter: avgDistFromCenter.toFixed(3),
        normalizedDist: normalizedDist.toFixed(3),
        humanLikeScore: humanLikeScore + '%',
        botRisk: botRisk + '%'
      });
      
      pillars.pcaData.bot = Math.max(0, Math.min(100, botRisk));
      pillars.pcaData.human = 100 - pillars.pcaData.bot;
      pillars.pcaData.score = pillars.pcaData.bot;
      
      console.log('✅ WRITING FINGERPRINT RESULT:', {
        botRisk: pillars.pcaData.bot + '%',
        humanLike: pillars.pcaData.human + '%',
        interpretation: pillars.pcaData.bot < 30 ? 'Human-like (consistent)' : pillars.pcaData.bot > 70 ? 'Bot-like (erratic)' : 'Mixed'
      });
    } else {
      pillars.pcaData.human = 50;
      pillars.pcaData.bot = 50;
      pillars.pcaData.score = 50;
      console.log('⚠️ WRITING FINGERPRINT: Insufficient data (only ' + (pcaData?.length || 0) + ' points)');
    }

    // 2. Location Mismatch - Use actual location confidence data from WorldMap
    // locationConfidence = { location: bool, timezone: bool, language: bool }
    // Each true = a match, false = mismatch
    console.log('🔍 LOCATION CONSISTENCY - Raw Input:', JSON.stringify(locationConfidence));
    
    // Check if we have location data (at least one criterion is TRUE)
    // Initial state is all false, which means WorldMap hasn't calculated yet
    const locationKeys = ['location', 'timezone', 'language'];
    const mismatchFromMap = typeof locationConfidence?.mismatchPercent === 'number'
      ? locationConfidence.mismatchPercent
      : null;

    const consideredSignals = locationKeys.filter(key => typeof locationConfidence?.[key] === 'boolean');
    const matches = consideredSignals.filter(key => locationConfidence?.[key] === true).length;
    const mismatchPercentRaw = mismatchFromMap !== null
      ? mismatchFromMap
      : (consideredSignals.length > 0
        ? ((consideredSignals.length - matches) / consideredSignals.length) * 100
        : null);

    console.log('🔎 LOCATION CONSISTENCY RAW:', {
      incoming: locationConfidence,
      mismatchFromMap,
      consideredSignals,
      matches,
      mismatchPercentRaw
    });
    
    if (typeof mismatchPercentRaw === 'number') {
      const mismatchPercent = Math.max(0, Math.min(100, mismatchPercentRaw));
      
      console.log('🔍 LOCATION CONSISTENCY Analysis:', {
        locationMatch: locationConfidence?.location === true ? '✓' : '✗',
        timezoneMatch: locationConfidence?.timezone === true ? '✓' : '✗',
        languageMatch: locationConfidence?.language === true ? '✓' : '✗',
        matches: `${matches}/${consideredSignals.length || 3}`,
        mismatchPercent: mismatchPercent.toFixed(0) + '%'
      });
      
      // Direct mapping: mismatch percentage = bot risk percentage
      pillars.locationMismatch.bot = Math.round(mismatchPercent);
      pillars.locationMismatch.human = 100 - pillars.locationMismatch.bot;
      pillars.locationMismatch.score = pillars.locationMismatch.bot;
      
      console.log('✅ LOCATION CONSISTENCY RESULT:', {
        botRisk: pillars.locationMismatch.bot + '%',
        interpretation: matches === consideredSignals.length ? 'All match (human-like)' : matches === 0 ? 'None match (suspicious)' : `${matches}/${consideredSignals.length} match`
      });
    } else {
      console.log('⚠️ LOCATION CONSISTENCY: No location signals yet (WorldMap still calculating), defaulting to 0%');
      // No location data means we can't assess - default to human-like (0% bot risk)
      pillars.locationMismatch.human = 100;
      pillars.locationMismatch.bot = 0;
      pillars.locationMismatch.score = 0;
    }

    // 3. Activity by Month - Monthly Consistency
    if (activityByMonth && activityByMonth.length >= 3) {
      const monthCounts = activityByMonth.map(m => m.count);
      const totalMonthActivity = monthCounts.reduce((a, b) => a + b, 0);
      const avgMonth = totalMonthActivity / monthCounts.length;
      const monthVariance = monthCounts.reduce((sum, val) => sum + Math.pow(val - avgMonth, 2), 0) / monthCounts.length;
      const monthStdDev = Math.sqrt(monthVariance);
      const monthCV = avgMonth > 0 ? monthStdDev / avgMonth : 0;
      const maxMonth = Math.max(...monthCounts);
      const minMonth = Math.min(...monthCounts);
      const maxShare = totalMonthActivity > 0 ? (maxMonth / totalMonthActivity) * 100 : 0;
      const inactiveMonths = monthCounts.filter(count => count === 0).length;
      
      console.log('🔍 MONTHLY PATTERNS:', {
        months: monthCounts.length,
        counts: monthCounts,
        avgPerMonth: avgMonth.toFixed(1),
        stdDev: monthStdDev.toFixed(2),
        coefficientOfVariation: monthCV.toFixed(3),
        maxShare: maxShare.toFixed(1) + '%',
        inactiveMonths
      });
      
      // Translate consistency into risk: extremely even distribution (CV near 0) looks automated.
      // Also flag if majority of activity sits in a single month (spiky) or there are long dormant periods.
      let consistencyRisk = (0.5 - monthCV) / 0.5 * 100; // CV >=0.5 -> 0 risk, CV ==0 -> 100 risk
      consistencyRisk = Math.max(0, Math.min(100, consistencyRisk));

      const spikePenalty = Math.max(0, (maxShare - 35) / 35 * 100); // if a single month holds >35% of activity, looks botted
      const inactivityPenalty = Math.min(100, (inactiveMonths / monthCounts.length) * 100 * 0.5); // up to 50% extra risk

      const monthBotRisk = Math.min(100, Math.round(consistencyRisk + spikePenalty + inactivityPenalty));
      pillars.activityByMonth.bot = monthBotRisk;
      pillars.activityByMonth.human = 100 - pillars.activityByMonth.bot;
      pillars.activityByMonth.score = pillars.activityByMonth.bot;
      
      console.log('✅ MONTHLY PATTERNS RESULT:', {
        botRisk: monthBotRisk + '%',
        interpretation: monthBotRisk > 70 ? 'Too uniform across months' : monthBotRisk > 40 ? 'Some automation signals' : 'Natural variation'
      });
    } else {
      pillars.activityByMonth.human = 50;
      pillars.activityByMonth.bot = 50;
      pillars.activityByMonth.score = 50;
      console.log('⚠️ MONTHLY PATTERNS: Insufficient data');
    }

    // 4. Sleep Pattern - Detect consistent inactive hours (sleep time)
    if (activityByHour && activityByHour.length === 24) {
      const hourCounts = activityByHour.map(h => h.count);
      const totalActivity = hourCounts.reduce((a, b) => a + b, 0);
      const avgHourly = totalActivity / 24;
      
      // Find consecutive low-activity hours (potential sleep window)
      const threshold = avgHourly * 0.3; // Hours with <30% of average activity
      const lowActivityHours = hourCounts.map((count, hour) => count < threshold ? hour : -1).filter(h => h !== -1);
      
      console.log('🔍 SLEEP PATTERN:', {
        hourCounts: hourCounts,
        avgHourly: avgHourly.toFixed(1),
        threshold: threshold.toFixed(1),
        lowActivityHours: lowActivityHours
      });
      
      // Find longest consecutive stretch of low activity
      let maxConsecutive = 0;
      let currentConsecutive = 0;
      
      for (let i = 0; i < 24; i++) {
        if (lowActivityHours.includes(i)) {
          currentConsecutive++;
        } else {
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
          currentConsecutive = 0;
        }
      }
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      
      // Check for wrap-around (sleep from 11pm to 7am spans midnight)
      if (lowActivityHours.includes(0) && lowActivityHours.includes(23)) {
        let wrapCount = 1;
        for (let i = 1; i < 24; i++) {
          if (lowActivityHours.includes(i)) wrapCount++;
          else break;
        }
        for (let i = 22; i >= 0; i--) {
          if (lowActivityHours.includes(i)) wrapCount++;
          else break;
        }
        maxConsecutive = Math.max(maxConsecutive, wrapCount);
      }
      
      console.log('🔍 SLEEP PATTERN Analysis:', {
        maxConsecutiveLowHours: maxConsecutive
      });
      
      let sleepBotRisk = 0;
      if (maxConsecutive >= 6 && maxConsecutive <= 9) {
        sleepBotRisk = 0;
      } else if (maxConsecutive < 6) {
        // Not enough downtime; ramp risk up quickly
        sleepBotRisk = Math.min(100, Math.round(((6 - maxConsecutive) / 6) * 100));
      } else if (maxConsecutive <= 12) {
        // Long breaks but still plausible
        sleepBotRisk = Math.min(100, Math.round(((maxConsecutive - 9) / 3) * 60));
      } else {
        // Beyond 12 hours low activity feels automated or dormant
        sleepBotRisk = 100;
      }

      pillars.sleepPattern.bot = sleepBotRisk;
      pillars.sleepPattern.human = 100 - sleepBotRisk;
      pillars.sleepPattern.score = sleepBotRisk;
      
      console.log('✅ SLEEP PATTERN RESULT:', {
        botRisk: sleepBotRisk + '%',
        interpretation: sleepBotRisk === 0 ? `Healthy sleep pattern (${maxConsecutive}h inactive)` : sleepBotRisk > 70 ? `Unnatural inactivity (${maxConsecutive}h)` : `Sleep window looks automated (${maxConsecutive}h)`
      });
    } else {
      pillars.sleepPattern.human = 50;
      pillars.sleepPattern.bot = 50;
      pillars.sleepPattern.score = 50;
      console.log('⚠️ SLEEP PATTERN: Insufficient data');
    }

    // 5. Activity by Weekday - Weekday Consistency
    if (activityByWeekday && activityByWeekday.length === 7) {
      const dayCounts = activityByWeekday.map(d => d.count);
      const totalWeekActivity = dayCounts.reduce((a, b) => a + b, 0);
      const avgDay = totalWeekActivity / 7;
      const dayVariance = dayCounts.reduce((sum, val) => sum + Math.pow(val - avgDay, 2), 0) / 7;
      const dayStdDev = Math.sqrt(dayVariance);
      const coefficientOfVariation = avgDay > 0 ? dayStdDev / avgDay : 0;
      
      const minCount = Math.min(...dayCounts);
      const maxCount = Math.max(...dayCounts);
      const range = maxCount - minCount;
      const dominantDayShare = totalWeekActivity > 0 ? (maxCount / totalWeekActivity) * 100 : 0;
      const quietDays = dayCounts.filter(count => count < avgDay * 0.4).length;
      
      console.log('🔍 WEEKDAY BEHAVIOR:', {
        counts: dayCounts,
        avgPerDay: avgDay.toFixed(1),
        min: minCount,
        max: maxCount,
        range: range,
        stdDev: dayStdDev.toFixed(2),
        coefficientOfVariation: coefficientOfVariation.toFixed(3),
        dominantDayShare: dominantDayShare.toFixed(1) + '%',
        quietDays
      });
      
      const uniformityRisk = (0.35 - coefficientOfVariation) / 0.35 * 100; // CV≥0.35 => 0 risk
      const clampedUniformity = Math.max(0, Math.min(100, uniformityRisk));
      const dominantDayPenalty = Math.max(0, (dominantDayShare - 28) / 32 * 100); // if one day >28% of activity
      const quietDayPenalty = Math.min(100, (quietDays / 7) * 100 * 0.6);

      const weekdayBotRisk = Math.min(100, Math.round(clampedUniformity + dominantDayPenalty + quietDayPenalty));
      pillars.activityByWeekday.bot = weekdayBotRisk;
      pillars.activityByWeekday.human = 100 - pillars.activityByWeekday.bot;
      pillars.activityByWeekday.score = pillars.activityByWeekday.bot;
      
      console.log('✅ WEEKDAY BEHAVIOR RESULT:', {
        botRisk: weekdayBotRisk + '%',
        interpretation: weekdayBotRisk > 70 ? 'Pattern too rigid across weekdays' : weekdayBotRisk > 40 ? 'Weekday distribution looks automated' : 'Natural weekday spread'
      });
    } else {
      pillars.activityByWeekday.human = 50;
      pillars.activityByWeekday.bot = 50;
      pillars.activityByWeekday.score = 50;
      console.log('⚠️ WEEKDAY BEHAVIOR: Insufficient data');
    }

    // 6. Subreddit Hotspots - Political, Finance (Crypto/Stocks), News activity
    if (userData && (userData.comments || userData.posts)) {
      // Combine all category dictionaries to mirror Interests widget logic
      const allCategories = {
        ...INTEREST_CATEGORIES,
        ...LEISURE_CATEGORIES,
        ...NSFW_CATEGORIES
      };

      const categorizeSubreddit = (subreddit) => {
        if (!subreddit) return null;
        const sub = subreddit.toLowerCase().trim();
        for (const [key, info] of Object.entries(allCategories)) {
          const matches = info.subs.some(catSub => {
            const cat = catSub.toLowerCase().trim();
            return sub === cat || sub.startsWith(cat + '_') || sub.startsWith(cat);
          });
          if (matches) {
            return { key, label: info.label };
          }
        }
        return null;
      };

      // Aggregate every comment/post into category counts
      const categoryCounts = {};
      const contentItems = [
        ...(userData.comments || []),
        ...(userData.posts || [])
      ];

      contentItems.forEach(item => {
        const category = categorizeSubreddit(item.subreddit);
        if (category) {
          if (!categoryCounts[category.key]) {
            categoryCounts[category.key] = { label: category.label, count: 0 };
          }
          categoryCounts[category.key].count += 1;
        }
      });

      const data = Object.entries(categoryCounts)
        .map(([key, info]) => ({ key, category: info.label, count: info.count }))
        .filter(entry => entry.count > 0)
        .sort((a, b) => b.count - a.count);

      const total = data.reduce((sum, entry) => sum + entry.count, 0);
      const dataWithPercentages = data.map(entry => ({
        ...entry,
        percentage: total > 0 ? (entry.count / total) * 100 : 0
      }));

      console.log('📊 SUBREDDIT FOCUS DATA SET');
      console.table(dataWithPercentages.map(entry => ({
        key: entry.key,
        label: entry.category,
        count: entry.count,
        percentage: entry.percentage.toFixed(2)
      })));

      const politicsEntry = dataWithPercentages.find(entry => entry.key === 'politics');
      const businessEntry = dataWithPercentages.find(entry => entry.key === 'business');

      const politicsPercentage = politicsEntry?.percentage || 0;
      const businessPercentage = businessEntry?.percentage || 0;
      const botHeavyPercentage = politicsPercentage + businessPercentage;

      console.log('🔍 SUBREDDIT FOCUS (aligned with Interests widget):', {
        totalCategories: dataWithPercentages.length,
        totalActivity: total,
        politicsPercentage: politicsPercentage.toFixed(2) + '%',
        businessPercentage: businessPercentage.toFixed(2) + '%',
        combined: botHeavyPercentage.toFixed(2) + '%'
      });

      pillars.subredditHotspots.bot = Math.round(botHeavyPercentage);
      pillars.subredditHotspots.human = 100 - pillars.subredditHotspots.bot;
      pillars.subredditHotspots.score = pillars.subredditHotspots.bot;

      console.log('✅ SUBREDDIT FOCUS RESULT:', pillars.subredditHotspots.bot + '% bot risk');
    } else {
      pillars.subredditHotspots.human = 50;
      pillars.subredditHotspots.bot = 50;
      pillars.subredditHotspots.score = 50;
    }

    // Calculate overall score (average of all pillars)
    const pillarArray = Object.values(pillars);
    const overallScore = pillarArray.reduce((sum, p) => sum + p.score, 0) / pillarArray.length;
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📊 BOT DETECTION FINAL SUMMARY');
    console.log('═══════════════════════════════════════');
    Object.entries(pillars).forEach(([key, value]) => {
      console.log(`${value.label}: ${value.bot}% bot | ${value.human}% human`);
    });
    console.log('───────────────────────────────────────');
    console.log(`OVERALL SCORE: ${Math.round(overallScore)}%`);
    console.log(`RISK LEVEL: ${overallScore < 30 ? 'Low' : overallScore < 60 ? 'Medium' : 'High'}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    
    return {
      score: Math.round(overallScore),
      level: overallScore < 30 ? 'Low' : overallScore < 60 ? 'Medium' : 'High',
      color: overallScore < 30 ? '#4ade80' : overallScore < 60 ? '#fbbf24' : '#ef4444',
      pillars: pillars
    };
  }, [pcaData, activityByHour, activityByWeekday, activityByDayOfMonth, activityByMonth, userData, locationConfidence]);

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3>Bot Detection</h3>
          <p className="stat-meta" style={{ marginBottom: '8px' }}>
            Behavioral pattern analysis
          </p>
        </div>
        
        {/* Legend */}
        <div style={{ 
          display: 'flex',
          gap: '8px',
          fontSize: '9px',
          color: COLORS.TEXT_MUTED,
          marginTop: '2px',
          marginRight: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '10px', height: '10px', background: COLORS.ACCENT_PRIMARY, borderRadius: '2px' }} />
            <span>Bot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '10px', height: '10px', background: '#2a2a2a', borderRadius: '2px' }} />
            <span>Human</span>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '6px 8px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        marginBottom: '6px'
      }}>
        <div>
          <div style={{ fontSize: '9px', color: COLORS.TEXT_MUTED }}>Overall Risk</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: botScore.color }}>
            {botScore.level}
          </div>
        </div>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '700',
          color: botScore.color
        }}>
          {botScore.score}%
        </div>
      </div>

      {/* 5 Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(botScore.pillars).map(([key, pillar]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ 
                fontSize: '9px', 
                fontWeight: '600',
                color: COLORS.TEXT_LIGHT_GREY,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{pillar.label}</span>
                <span style={{ color: pillar.bot > pillar.human ? COLORS.ACCENT_PRIMARY : '#2a2a2a' }}>
                  {Math.round(pillar.bot)}%
                </span>
              </div>
              
              {/* Human > Bot Bar */}
              <div style={{ 
                position: 'relative',
                height: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '3px',
                overflow: 'hidden',
                display: 'flex'
              }}>
                {/* Bot side (left, red) */}
                <div style={{
                  height: '100%',
                  width: `${Math.max(0, pillar.bot)}%`,
                  background: COLORS.ACCENT_PRIMARY,
                  transition: 'width 0.3s ease',
                  minWidth: pillar.bot > 0 ? '2px' : '0px'
                }} />
                
                {/* Human side (right, dark grey) */}
                <div style={{
                  height: '100%',
                  flex: 1,
                  background: '#2a2a2a',
                  transition: 'width 0.3s ease',
                  minWidth: pillar.human > 0 ? '2px' : '0px'
                }} />
                
                {/* Center line */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  height: '100%',
                  width: '1px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
