import { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

export default function HackerText({ text, duration = 2000, style }) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.floor(duration / 30); // ~30fps
    const charsPerFrame = text.length / totalFrames;

    const interval = setInterval(() => {
      frame++;
      
      if (frame >= totalFrames) {
        setDisplayText(text);
        setIsAnimating(false);
        clearInterval(interval);
        return;
      }

      // Calculate how many characters should be revealed
      const revealedCount = Math.floor(frame * charsPerFrame);
      
      // Build the display text
      let newText = '';
      for (let i = 0; i < text.length; i++) {
        if (i < revealedCount) {
          // Character is revealed
          newText += text[i];
        } else if (text[i] === ' ' || text[i] === '.') {
          // Keep spaces and dots
          newText += text[i];
        } else {
          // Random character
          newText += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(newText);
    }, 30);

    return () => clearInterval(interval);
  }, [text, duration]);

  return <span style={style}>{displayText || text}</span>;
}
