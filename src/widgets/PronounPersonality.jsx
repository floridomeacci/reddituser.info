import { useEffect, useRef, useState, useMemo } from 'react';
import { getDesignTokens } from '../design-tokens';

const traitDescriptions = {
  'Introspective': 'High "I/Me" usage (>12%) indicates self-focus and introspection. Research shows correlation with depression or self-awareness, but NOT narcissism. People who are introspective tend to be more reflective and analytical about their experiences.',
  'Authoritative': 'Low "I/Me" usage (<4%) correlates with power and status. People in leadership positions tend to use fewer first-person pronouns. This linguistic pattern is associated with confidence and authority in communication.',
  'Engaging': 'High "You" usage (>8%) indicates direct, conversational style. Common in persuasive communication and shows engagement with audience. Research links this to better social connections and collaborative problem-solving abilities.',
  'Collective': 'High "We/Us" usage (>5%) reflects group identity and collective thinking. Shows strong sense of social connection and teamwork. Associated with community-oriented mindset and collaborative work style.',
  'Observer': 'High "They/Them" usage (>8%) shows external focus and attention to others. Indicates storytelling ability and interest in people. Often seen in empathetic communicators who pay attention to others\' perspectives.',
  'Self-Reflective': 'Replying to own comments indicates thorough communication and desire to clarify. Research shows this is common in expert communities and correlates with conscientiousness and attention to detail.',
  'Inquisitive': 'Frequent question-asking is linked to openness, learning orientation, and growth mindset. Research associates this with better collaborative problem-solving and intellectual curiosity.'
};

const PronounPersonality = ({ userData, style }) => {
  const [selectedTrait, setSelectedTrait] = useState(null);
  const radarCanvasRef = useRef(null);

  const pronounData = useMemo(() => {
    if (!userData) return null;

    const allPosts = userData?.posts || [];
    const allComments = userData?.comments || [];

    const pronouns = {
      'I/Me': ['i', 'me', 'my', 'mine', 'myself'],
      'You': ['you', 'your', 'yours', 'yourself', 'yourselves'],
      'He/Him': ['he', 'him', 'his', 'himself'],
      'She/Her': ['she', 'her', 'hers', 'herself'],
      'They/Them': ['they', 'them', 'their', 'theirs', 'themselves', 'themself'],
      'We/Us': ['we', 'us', 'our', 'ours', 'ourselves'],
      'It': ['it', 'its', 'itself']
    };

    const counts = {
      'I/Me': 0,
      'You': 0,
      'He/Him': 0,
      'She/Her': 0,
      'They/Them': 0,
      'We/Us': 0,
      'It': 0
    };

    const processText = (text) => {
      if (!text) return;
      const words = text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);

      words.forEach(word => {
        for (const [category, pronounList] of Object.entries(pronouns)) {
          if (pronounList.includes(word)) {
            counts[category]++;
          }
        }
      });
    };

    allPosts.forEach(post => processText(post.title + ' ' + (post.selftext || post.post || '')));
    allComments.forEach(comment => processText(comment.body || comment.comment));

    const totalPronouns = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalPronouns === 0) return null;

    const percentages = {};
    for (const [category, count] of Object.entries(counts)) {
      percentages[category] = (count / totalPronouns * 100);
    }

    return percentages;
  }, [userData]);

  const radarData = useMemo(() => {
    if (!pronounData) return [];

    const traits = [];

    // Introspection (High I/Me >12%)
    if (pronounData['I/Me'] > 12) {
      traits.push({ trait: 'Introspective', value: Math.min((pronounData['I/Me'] / 12) * 100, 100) });
    } else {
      traits.push({ trait: 'Introspective', value: (pronounData['I/Me'] / 12) * 100 });
    }

    // Authoritative (Low I/Me <4%)
    if (pronounData['I/Me'] < 4) {
      traits.push({ trait: 'Authoritative', value: Math.min(((4 - pronounData['I/Me']) / 4) * 100, 100) });
    } else {
      traits.push({ trait: 'Authoritative', value: 0 });
    }

    // Engaging (High You >8%)
    if (pronounData['You'] > 8) {
      traits.push({ trait: 'Engaging', value: Math.min((pronounData['You'] / 8) * 100, 100) });
    } else {
      traits.push({ trait: 'Engaging', value: (pronounData['You'] / 8) * 100 });
    }

    // Collective (High We/Us >5%)
    if (pronounData['We/Us'] > 5) {
      traits.push({ trait: 'Collective', value: Math.min((pronounData['We/Us'] / 5) * 100, 100) });
    } else {
      traits.push({ trait: 'Collective', value: (pronounData['We/Us'] / 5) * 100 });
    }

    // Observer (High They/Them >8%)
    if (pronounData['They/Them'] > 8) {
      traits.push({ trait: 'Observer', value: Math.min((pronounData['They/Them'] / 8) * 100, 100) });
    } else {
      traits.push({ trait: 'Observer', value: (pronounData['They/Them'] / 8) * 100 });
    }

    // Self-Reflective (Self-reply rate) - detect by multiple comments in same thread
    const allComments = userData?.comments || [];
    const username = (userData?.username || userData?.about?.name || 'unknown').toLowerCase();
    
    // Group comments by thread (link_id)
    const commentsByThread = {};
    allComments.forEach(c => {
      const threadId = c.link_id || 'unknown';
      if (!commentsByThread[threadId]) commentsByThread[threadId] = [];
      commentsByThread[threadId].push(c);
    });
    
    // Count threads where user commented more than once (self-reply behavior)
    const threadsWithMultipleComments = Object.values(commentsByThread).filter(comments => comments.length > 1).length;
    const selfReplyRate = Object.keys(commentsByThread).length > 0 
      ? (threadsWithMultipleComments / Object.keys(commentsByThread).length) * 100 
      : 0;
    // Scale: 0-30% multi-comment thread rate maps to 0-100%
    traits.push({ trait: 'Self-Reflective', value: Math.min((selfReplyRate / 30) * 100, 100) });

    // Inquisitive (Question-asking rate)
    const allTexts = [
      ...allComments.map(c => c.body || c.comment || ''),
      ...(userData?.posts || []).map(p => (p.title || '') + ' ' + (p.selftext || p.post || ''))
    ];
    const textsWithQuestions = allTexts.filter(t => t.includes('?'));
    const questionRate = allTexts.length > 0 ? (textsWithQuestions.length / allTexts.length) * 100 : 0;
    // Scale: 0-40% question rate maps to 0-100%
    traits.push({ trait: 'Inquisitive', value: Math.min((questionRate / 40) * 100, 100) });

    return traits;
  }, [pronounData, userData]);

  // Auto-select the highest-value trait
  useEffect(() => {
    if (radarData.length > 0 && !selectedTrait) {
      const highest = radarData.reduce((a, b) => (b.value > a.value ? b : a), radarData[0]);
      setSelectedTrait(highest.trait);
    }
  }, [radarData, selectedTrait]);

  useEffect(() => {
    if (!userData || !pronounData) return;
    
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    
    const extraLeft = 80;
    const extraRight = 80;
    const extraTop = 60;
    const extraBottom = 20;
    const totalWidth = containerWidth + extraLeft + extraRight;
    const totalHeight = containerHeight + extraTop + extraBottom;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);
    
    const centerX = (totalWidth / 2) - (containerWidth * 0.22) + extraLeft;
    const centerY = (totalHeight / 2) - (totalHeight * 0.05);
    const radius = Math.min(containerWidth, containerHeight) * 0.3864;
    
    const traits = radarData;
    const normalizedData = traits.map(t => t.value / 100);
    
    const rootStyles = getComputedStyle(document.documentElement);
    const radarGridColor = rootStyles.getPropertyValue('--radar-grid-color').trim() || 'rgba(0, 255, 255, 0.2)';
    const radarDataColor = rootStyles.getPropertyValue('--radar-data-color').trim() || 'rgba(0, 255, 203, 0.3)';
    const radarDataStroke = rootStyles.getPropertyValue('--radar-data-stroke').trim() || 'rgba(0, 255, 203, 0.8)';
    const radarPointColor = rootStyles.getPropertyValue('--radar-point-color').trim() || '#ffef5a';
    const radarLabelColor = rootStyles.getPropertyValue('--radar-label-color').trim() || 'rgba(255, 255, 255, 0.8)';
    
    // Draw grid
    ctx.strokeStyle = radarGridColor;
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      const gridRadius = (radius / 4) * i;
      
      for (let j = 0; j <= normalizedData.length; j++) {
        const angle = (Math.PI * 2 / normalizedData.length) * j - Math.PI / 2;
        const x = centerX + Math.cos(angle) * gridRadius;
        const y = centerY + Math.sin(angle) * gridRadius;
        
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw rays
    normalizedData.forEach((_, index) => {
      const angle = (Math.PI * 2 / normalizedData.length) * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    
    // Draw data polygon
    ctx.fillStyle = radarDataColor;
    ctx.strokeStyle = radarDataStroke;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    normalizedData.forEach((value, index) => {
      const angle = (Math.PI * 2 / normalizedData.length) * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw points
    ctx.shadowBlur = 0;
    normalizedData.forEach((value, index) => {
      const angle = (Math.PI * 2 / normalizedData.length) * index - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      const isSelected = traits[index].trait === selectedTrait;
      ctx.fillStyle = isSelected ? '#00ff7f' : radarPointColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw labels
    ctx.shadowBlur = 0;
    ctx.fillStyle = radarLabelColor;
    ctx.font = '11px "Space Grotesk", "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    traits.forEach((trait, index) => {
      const angle = (Math.PI * 2 / normalizedData.length) * index - Math.PI / 2;
      const labelRadius = radius * 1.28;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.fillStyle = radarLabelColor;
      ctx.fillText(trait.trait, x, y);
      
      ctx.font = '9px "Space Grotesk", "Inter", system-ui, sans-serif';
      ctx.fillStyle = Math.round(trait.value) > 0 ? radarPointColor : 'rgba(255,255,255,0.2)';
      ctx.fillText(Math.round(trait.value) > 0 ? `${Math.round(trait.value)}%` : 'No data', x, y + 12);
      ctx.fillStyle = radarLabelColor;
      ctx.font = '11px "Space Grotesk", "Inter", system-ui, sans-serif';
    });
    
  }, [userData, pronounData, radarData, selectedTrait]);

  const handleCanvasClick = (event) => {
    if (!userData || !pronounData) return;

    const canvas = radarCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    
    const traits = radarData;
    
    const anglePerTrait = (Math.PI * 2) / traits.length;
    const traitIndex = Math.round(angle / anglePerTrait) % traits.length;
    
    setSelectedTrait(traits[traitIndex].trait);
  };

  if (!pronounData || radarData.length === 0) {
    return (
      <div className="cell radar-cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
        <h3>Linguistic Personality Profile</h3>
        <p className="stat-meta" style={{ marginBottom: '8px' }}>Based on pronoun usage patterns</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          opacity: 0.5 
        }}>
          <p style={{ fontSize: '11px' }}>Not enough data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cell radar-cell" style={{ gridColumn: 'span 2', gridRow: 'span 2', ...style }}>
      <h3>Linguistic Personality Profile</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Based on pronoun usage patterns</p>
      <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center', width: '100%', minHeight: 0, overflow: 'visible', paddingTop: '40px', position: 'relative' }}>
        <div className="personality-info" style={{ flex: '0 0 180px', fontSize: '11px', lineHeight: '1.4' }}>
          {selectedTrait ? (() => {
            const traitValue = Math.round(radarData.find(t => t.trait === selectedTrait)?.value || 0);
            return (
              <div className="trait-description">
                <strong style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  {selectedTrait} {traitValue > 0 ? `(${traitValue}%)` : ''}
                </strong>
                {traitValue > 0 ? (
                  <p style={{ margin: 0, color: '#999' }}>{traitDescriptions[selectedTrait]}</p>
                ) : (
                  <p style={{ margin: 0, color: '#555' }}>No significant signal for this trait in the user's writing.</p>
                )}
              </div>
            );
          })() : (
            <div className="trait-description">
              <strong style={{ color: 'white' }}>Click a trait</strong> <span style={{ color: '#999' }}>to see what it means</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
          <canvas 
            ref={radarCanvasRef}
            id="radarChart" 
            className="radar-canvas" 
            style={{ cursor: 'pointer', position: 'absolute', top: '-60px', left: '-80px' }}
            onClick={handleCanvasClick}
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default PronounPersonality;
