import { useEffect, useRef, useState } from 'react';
import { getDesignTokens } from '../design-tokens';

const traitDescriptions = {
  'Openness': 'Openness reflects curiosity and willingness to try new things. High scores suggest creativity and open-mindedness, while low scores indicate preference for routine and tradition.',
  'Conscientiousness': 'Conscientiousness measures organization and dependability. High scores show discipline and goal-oriented behavior, while low scores suggest spontaneity and flexibility.',
  'Extroversion': 'Extroversion indicates sociability and energy from social interaction. High scores show outgoing and talkative nature, while low scores suggest preference for solitude.',
  'Agreeableness': 'Agreeableness reflects compassion and cooperation. High scores indicate kindness and empathy, while low scores suggest directness and competitiveness.',
  'Neuroticism': 'Neuroticism measures emotional stability. High scores indicate sensitivity to stress and negative emotions, while low scores suggest calmness and resilience.'
};

export default function PersonalityRadar({ userData, style }) {
  const [selectedTrait, setSelectedTrait] = useState('Openness');
  const radarCanvasRef = useRef(null);

  useEffect(() => {
    if (!userData) return;
    
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
    
    const personality = userData.personality || {};
    const traits = [
      { name: 'Openness', value: personality.Openness || 0.5 },
      { name: 'Conscientiousness', value: personality.Conscientiousness || 0.5 },
      { name: 'Extroversion', value: personality.Extroversion || 0.5 },
      { name: 'Agreeableness', value: personality.Agreeableness || 0.5 },
      { name: 'Neuroticism', value: personality.Neuroticism || 0.5 }
    ];
    const normalizedData = traits.map(t => t.value);
    
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
      
      const isSelected = traits[index].name === selectedTrait;
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
      ctx.fillText(trait.name, x, y);
      
      ctx.font = '9px "Space Grotesk", "Inter", system-ui, sans-serif';
      ctx.fillStyle = radarPointColor;
      ctx.fillText(`${Math.round(trait.value * 100)}%`, x, y + 12);
      ctx.fillStyle = radarLabelColor;
      ctx.font = '11px "Space Grotesk", "Inter", system-ui, sans-serif';
    });
    
  }, [userData, selectedTrait]);

  const handleCanvasClick = (event) => {
    if (!userData || !userData.personality) return;

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
    
    const personality = userData.personality || {};
    const traits = [
      { name: 'Openness', value: personality.Openness || 0.5 },
      { name: 'Conscientiousness', value: personality.Conscientiousness || 0.5 },
      { name: 'Extroversion', value: personality.Extroversion || 0.5 },
      { name: 'Agreeableness', value: personality.Agreeableness || 0.5 },
      { name: 'Neuroticism', value: personality.Neuroticism || 0.5 }
    ];
    
    const anglePerTrait = (Math.PI * 2) / traits.length;
    const traitIndex = Math.round(angle / anglePerTrait) % traits.length;
    
    setSelectedTrait(traits[traitIndex].name);
  };

  return (
    <div className="cell radar-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style }}>
      <h3>Personality Profile</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>Big 5 personality traits from comment analysis</p>
      <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center', width: '100%', minHeight: 0, overflow: 'visible', paddingTop: '40px', position: 'relative' }}>
        <div className="personality-info" style={{ flex: '0 0 180px', fontSize: '11px', lineHeight: '1.4' }}>
          {selectedTrait ? (
            <div className="trait-description">
              <strong style={{ color: 'white', display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                {selectedTrait} ({Math.round((userData?.personality?.[selectedTrait] || 0.5) * 100)}%)
              </strong>
              <p style={{ margin: 0, color: '#999' }}>{traitDescriptions[selectedTrait]}</p>
            </div>
          ) : (
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
}
