import { useState, useEffect } from 'react';

export default function AccountAge({ userData, style }) {
  const [displayValue, setDisplayValue] = useState('');
  
  if (!userData) return null;
  
  // Get account creation timestamp from about field (new API) or account_info (old API)
  const createdUtc = userData?.about?.created_utc || userData?.about?.created || 
                     userData?.account_info?.account_created || userData?.account_info?.created_utc;
  
  // Calculate account age from timestamp
  const calculateAge = (timestamp) => {
    if (!timestamp) return null;
    const created = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - created;
    
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const days = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    return { years, days, hours, mins, totalHours: years * 365 * 24 + days * 24 + hours };
  };
  
  const age = calculateAge(createdUtc);
  const targetValue = age ? `${age.years} Years, ${age.days} days, ${age.hours.toString().padStart(2, '0')}:${age.mins.toString().padStart(2, '0')} hours` : '—';
  
  useEffect(() => {
    if (!age) {
      setDisplayValue('—');
      return;
    }
    
    const totalHours = age.totalHours;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = totalHours / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= totalHours) {
        setDisplayValue(targetValue);
        clearInterval(interval);
      } else {
        const y = Math.floor(current / (365 * 24));
        const d = Math.floor((current % (365 * 24)) / 24);
        const h = Math.floor(current % 24);
        setDisplayValue(`${y} Years, ${d} days, ${h.toString().padStart(2, '0')}:${age.mins.toString().padStart(2, '0')} hours`);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [createdUtc]);
  
  // Get joined date
  const joinedDate = createdUtc ? new Date(createdUtc * 1000).toLocaleDateString() : 'Unknown';
  
  return (
    <div className="cell stat-cell" style={{ gridColumn: 'span 1', gridRow: 'span 1', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <h3 style={{ fontSize: '11px', margin: '0', opacity: 0.6 }}>ACCOUNT AGE</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', lineHeight: 1, color: '#ffffff' }}>
          {displayValue}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20px' }}>
        <p style={{ fontSize: '11px', margin: '0', opacity: 0.5 }}>
          Joined {joinedDate}
        </p>
      </div>
    </div>
  );
}
