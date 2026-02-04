import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { COLORS, CHART_CONFIG, getDesignTokens } from '../design-tokens';
import './SentimentStacks.css';

const SentimentStacks = ({ comments }) => {
  const tokens = getDesignTokens();
  
  const sentimentData = useMemo(() => {
    if (!comments || comments.length === 0) {
      console.log('SentimentStacks: No comments provided');
      return { scatterData: [], avgPolarity: 0, avgSubjectivity: 0, noData: true, minDate: null, maxDate: null };
    }

    // Calculate average polarity from all comments with sentiment
    const commentsWithSentiment = comments.filter(c => c.sentiment && c.sentiment.polarity !== undefined && (c.timestamp || c.created_utc));
    
    console.log(`SentimentStacks: ${comments.length} total comments, ${commentsWithSentiment.length} with sentiment`);
    
    if (commentsWithSentiment.length === 0) {
      return { scatterData: [], avgPolarity: 0, avgSubjectivity: 0, noData: true, totalComments: comments.length, minDate: null, maxDate: null };
    }

    const totalPolarity = commentsWithSentiment.reduce((sum, c) => sum + c.sentiment.polarity, 0);
    const totalSubjectivity = commentsWithSentiment.reduce((sum, c) => sum + c.sentiment.subjectivity, 0);
    const avgPolarity = totalPolarity / commentsWithSentiment.length;
    const avgSubjectivity = totalSubjectivity / commentsWithSentiment.length;

    // Find the earliest and latest timestamps
    const timestamps = commentsWithSentiment.map(c => c.timestamp || c.created_utc);
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);
    
    // Calculate IQR to remove time outliers
    const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
    const q1Index = Math.floor(sortedTimestamps.length * 0.25);
    const q3Index = Math.floor(sortedTimestamps.length * 0.75);
    const q1 = sortedTimestamps[q1Index];
    const q3 = sortedTimestamps[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Filter out outliers
    const commentsWithoutOutliers = commentsWithSentiment.filter(c => {
      const timestamp = c.timestamp || c.created_utc;
      return timestamp >= lowerBound && timestamp <= upperBound;
    });
    
    // Recalculate min/max after removing outliers
    const filteredTimestamps = commentsWithoutOutliers.map(c => c.timestamp || c.created_utc);
    const filteredMinTimestamp = Math.min(...filteredTimestamps);
    const filteredMaxTimestamp = Math.max(...filteredTimestamps);
    const minDate = new Date(filteredMinTimestamp * 1000);
    const maxDate = new Date(filteredMaxTimestamp * 1000);
    
    // Convert to scatter plot data with time since first comment
    const scatterData = commentsWithoutOutliers.map(comment => {
      const timestamp = comment.timestamp || comment.created_utc;
      const daysSinceStart = (timestamp - filteredMinTimestamp) / 86400; // Convert to days
      
      let emoji;
      if (comment.sentiment.polarity > 0.1) {
        emoji = '😇';
      } else if (comment.sentiment.polarity < -0.1) {
        emoji = '😈';
      } else {
        emoji = '😐';
      }
      
      return {
        time: daysSinceStart,
        sentiment: comment.sentiment.polarity,
        emoji,
        date: new Date(timestamp * 1000)
      };
    });

    return {
      scatterData,
      avgPolarity: avgPolarity.toFixed(3),
      avgSubjectivity: avgSubjectivity.toFixed(3),
      totalComments: commentsWithSentiment.length,
      minDate,
      maxDate
    };
  }, [comments]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--spacing-xs)',
          fontSize: 'var(--font-size-tiny)'
        }}>
          <div className="stat-meta">{data.emoji}</div>
          <div className="stat-meta">Date: {data.date.toLocaleDateString()}</div>
          <div className="stat-meta">Sentiment: {data.sentiment.toFixed(3)}</div>
        </div>
      );
    }
    return null;
  };

  // Show message if no sentiment data
  if (sentimentData.noData) {
    return (
      <div className="sentiment-stacks-container">
        <div className="no-sentiment-data">
          <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', padding: '20px' }}>
            No sentiment data available
            {sentimentData.totalComments > 0 && (
              <span style={{ display: 'block', fontSize: '12px', marginTop: '8px' }}>
                This analysis was cached before sentiment analysis was added. Clear cache and re-analyze to see sentiment data.
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
          <XAxis 
            type="number" 
            dataKey="time" 
            name="Days"
            stroke={tokens.chart.axis}
            tick={CHART_CONFIG.axis.tick}
            tickFormatter={(value) => {
              if (!sentimentData.minDate) return '';
              const date = new Date(sentimentData.minDate.getTime() + value * 86400000);
              return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }}
            label={{ 
              value: sentimentData.minDate && sentimentData.maxDate 
                ? `Time (${sentimentData.minDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${sentimentData.maxDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` 
                : 'Time (days)', 
              position: 'insideBottom', 
              offset: -10, 
              fill: tokens.chart.axis 
            }}
          />
          <YAxis 
            type="number" 
            dataKey="sentiment" 
            name="Sentiment"
            domain={[-1, 1]}
            ticks={[-1, 0, 1]}
            stroke={tokens.chart.axis}
            tick={CHART_CONFIG.axis.tick}
            tickFormatter={(value) => {
              if (value === -1) return 'Angry';
              if (value === 0) return 'Neutral';
              if (value === 1) return 'Happy';
              return '';
            }}
            label={{ value: 'Sentiment', angle: -90, position: 'insideLeft', fill: tokens.chart.axis }}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter 
            data={sentimentData.scatterData} 
            opacity={0.8}
            shape={(props) => {
              const { cx, cy, payload } = props;
              return (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12px"
                  style={{ cursor: 'pointer' }}
                >
                  {payload.emoji}
                </text>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentStacks;
