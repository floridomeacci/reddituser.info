import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../design-tokens';
import { analyzeLanguages } from '../lib/languageUtils';

export default function LanguageDetection({ userData, style }) {
  const colorPalette = [
    COLORS.DATA_1 || '#ff6b6b',
    COLORS.DATA_2 || '#4ecdc4',
    COLORS.DATA_3 || '#45b7d1',
    COLORS.DATA_4 || '#96ceb4',
    COLORS.DATA_5 || '#ffeaa7',
    COLORS.DATA_6 || '#dfe6e9',
    COLORS.DATA_7 || '#a29bfe',
    COLORS.DATA_8 || '#fd79a8',
    COLORS.DATA_9 || '#00b894',
    COLORS.DATA_10 || '#e17055'
  ];

  const { languageData, totalItems, primaryLanguage } = useMemo(() => {
    const analysis = analyzeLanguages(userData);
    
    if (analysis.totalItems === 0) {
      return { languageData: [], totalItems: 0, primaryLanguage: null };
    }

    // Separate languages >= 3% and < 3%
    // Languages under 3% are assumed to be the main language (misdetections)
    const mainLanguages = [];
    let underThresholdCount = 0;
    
    analysis.languageData.forEach(lang => {
      if (lang.percentage >= 3) {
        mainLanguages.push({ ...lang });
      } else {
        underThresholdCount += lang.count;
      }
    });
    
    // Add under-threshold count to the primary language
    if (underThresholdCount > 0 && mainLanguages.length > 0) {
      mainLanguages[0].count += underThresholdCount;
      // Recalculate percentage for primary language
      const newTotal = mainLanguages.reduce((sum, l) => sum + l.count, 0);
      mainLanguages.forEach(lang => {
        lang.percentage = (lang.count / newTotal) * 100;
      });
    }

    const languageData = mainLanguages.map((lang, index) => ({
      ...lang,
      percentage: lang.percentage.toFixed(1),
      fill: colorPalette[index % colorPalette.length]
    }));

    const primaryLanguage = languageData.length > 0 ? languageData[0] : null;

    return { languageData, totalItems: analysis.totalItems, primaryLanguage };
  }, [userData]);

  if (languageData.length === 0) {
    return (
      <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Language Detection</h3>
        <p className="stat-meta">Languages used in posts & comments</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '11px' }}>No text data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px'
        }}>
          <div style={{ color: data.fill, fontWeight: 'bold' }}>{data.name}</div>
          <div style={{ color: '#fff' }}>{data.count} items ({data.percentage}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Language Detection</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        {totalItems} items analyzed • {languageData.length} language{languageData.length !== 1 ? 's' : ''} detected
      </p>
      
      {languageData.length === 1 ? (
        // Single language - simplified display
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100% - 60px)',
        }}>
          <div style={{ 
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: primaryLanguage.fill, marginBottom: '12px' }}>
              {primaryLanguage.name}
            </div>
            <div style={{ fontSize: '13px', color: COLORS.TEXT_MUTED }}>
              All content in {primaryLanguage.name}
            </div>
          </div>
        </div>
      ) : (
        // Multiple languages - split view
        <div style={{ display: 'flex', height: 'calc(100% - 60px)', gap: '16px' }}>
          {/* Left side - Primary language & chart */}
          <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column' }}>
            {/* Primary language highlight */}
            {primaryLanguage && (
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '8px',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>Primary Language</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: primaryLanguage.fill }}>
                  {primaryLanguage.name}
                </div>
                <div style={{ fontSize: '12px', color: '#fff' }}>
                  {primaryLanguage.percentage}% of content
                </div>
              </div>
            )}
            
            {/* Pie chart */}
            <div style={{ flex: 1, minHeight: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                    stroke="none"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Right side - Language list */}
          <div style={{ 
            flex: '0 0 45%', 
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {languageData.map((lang, index) => (
              <div 
                key={lang.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  marginBottom: '4px',
                  background: index === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${lang.fill}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: index === 0 ? 'bold' : 'normal',
                    color: '#fff'
                  }}>
                    {lang.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#999' }}>
                    {lang.count} item{lang.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: lang.fill
                }}>
                  {lang.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
