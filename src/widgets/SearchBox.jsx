import { useState, useEffect, useRef } from 'react';
import { analyzeWithQueue } from '../lib/apiClient';

export default function SearchBox({ userData, onUserDataChange, isLoading, setIsLoading, style, initialUsername, autoSearch }) {
  const [searchUsername, setSearchUsername] = useState(initialUsername || '');
  const [queueInfo, setQueueInfo] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const autoSearchTriggered = useRef(false);
  
  // Update search field when userData changes
  useEffect(() => {
    if (userData?.username || userData?.about?.name) {
      const username = userData.username || userData.about.name;
      setSearchUsername(username);
    }
  }, [userData]);
  
  // Auto-search when initialUsername is provided with autoSearch flag
  useEffect(() => {
    if (initialUsername && autoSearch && !autoSearchTriggered.current && !userData) {
      autoSearchTriggered.current = true;
      // Trigger search programmatically
      triggerSearch(initialUsername);
    }
  }, [initialUsername, autoSearch, userData]);

  // Check if current search is different from loaded user
  const isCurrentUser = () => {
    const currentUsername = (userData?.username || userData?.about?.name || '').toLowerCase();
    const searchUsernameClean = searchUsername.trim().toLowerCase();
    return currentUsername === searchUsernameClean && currentUsername !== '';
  };

  // Shared search logic used by both form submit and auto-search
  const triggerSearch = async (username) => {
    const usernameToSearch = username || searchUsername.trim();
    if (!usernameToSearch) return;

    setIsLoading(true);
    setQueueInfo(null);
    try {
      const payload = {
        username: usernameToSearch,
        top: 0,
        include_raw: true,
      };
      const json = await analyzeWithQueue(payload, {
        attempts: 3,
        baseDelay: 600,
        pollIntervalMs: 1500,
        onUpdate: (info) => setQueueInfo(info)
      });
      
      // Check if server returned private_account error
      if (json?.error === 'private_account') {
        alert(json.message || 'This account appears to be private or has no public activity. Cannot analyze.');
        return;
      }
      
      // Double-check on client side (in case of older server)
      const hasComments = json?.comments?.length > 0;
      const hasPosts = json?.posts?.length > 0;
      const hasAbout = json?.about || json?.account_info;
      
      if (hasAbout && !hasComments && !hasPosts) {
        alert('This account appears to be private or has no public activity. Cannot analyze.');
        return; // Don't store or display private account data
      }
      
      onUserDataChange(json);
      // Username will stay in input field via useEffect
      // Reset consent checkbox after successful analysis
      setConsentChecked(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Check if it's a 403 private account error
      if (error.message?.includes('403')) {
        alert('This account appears to be private or has no public activity. Cannot analyze.');
      } else {
        alert('Failed to fetch user data. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setQueueInfo(null), 1000);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await triggerSearch();
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '16px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          u/
        </span>
        <input
          type="text"
          value={searchUsername}
          onChange={(e) => {
            setSearchUsername(e.target.value);
            // Reset consent when username changes
            if (consentChecked) setConsentChecked(false);
          }}
          placeholder="username"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '16px 16px 16px 44px',
            fontSize: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
          color: '#fff',
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#ff6b6b';
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.target.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !searchUsername.trim() || isCurrentUser() || !consentChecked}
        style={{
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          background: isLoading || !searchUsername.trim() || isCurrentUser() || !consentChecked
            ? 'rgba(255, 107, 107, 0.3)' 
            : '#ff6b6b',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          cursor: isLoading || !searchUsername.trim() || isCurrentUser() || !consentChecked ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: isLoading || !searchUsername.trim() || isCurrentUser() || !consentChecked
            ? 'none' 
            : '0 4px 16px rgba(255, 107, 107, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && searchUsername.trim() && !isCurrentUser() && consentChecked) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = '#ff5252';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && searchUsername.trim() && !isCurrentUser() && consentChecked) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = '#ff6b6b';
          }
        }}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        userSelect: 'none',
        marginTop: '-4px'
      }}>
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          disabled={isLoading}
          style={{
            width: '18px',
            height: '18px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            accentColor: '#ff6b6b'
          }}
        />
        <span>I consent to my data being analyzed and confirm this is my account</span>
      </label>
      
      {queueInfo && queueInfo.status && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#ccc' }}>
          {queueInfo.status === 'queued' && (
            <>
              {typeof queueInfo.position === 'number' ? (
                queueInfo.position <= 0 ? 'You are up next…' : `You are #${queueInfo.position} in queue…`
              ) : 'Added to queue…'}
            </>
          )}
          {queueInfo.status === 'processing' && 'Processing your request…'}
          {(queueInfo.eta_seconds || queueInfo.eta) && (
            <div style={{ color: '#999' }}>ETA ~ {Math.ceil((queueInfo.eta_seconds || queueInfo.eta) / 1)}s</div>
          )}
        </div>
      )}
    </form>
  );
}
