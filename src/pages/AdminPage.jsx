import { useState, useEffect, useMemo } from 'react';
import { resolveApiBase, analyzeWithQueue } from '../lib/apiClient';
import { COLORS } from '../design-tokens';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeTab, setActiveTab] = useState('users');

  // Friends Network state
  const [fnUsername, setFnUsername] = useState('');
  const [fnUserData, setFnUserData] = useState(null);
  const [fnLoading, setFnLoading] = useState(false);
  const [fnError, setFnError] = useState('');
  const [fnResult, setFnResult] = useState(null);
  const [fnAiLoading, setFnAiLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const validUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
      fetchUsers();
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    setUsername('');
    setPassword('');
    setUsers([]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiBase = await resolveApiBase();
      const response = await fetch(`${apiBase}/admin/cached-users`, {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out empty/private accounts (no comments and no posts)
        const filteredUsers = (data.users || []).filter(user => 
          user.total_comments > 0 || user.total_posts > 0
        );
        setUsers(filteredUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error connecting to API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Friends Network helpers ──────────────────────────────────
  const extractFriendSentences = (userData) => {
    if (!userData || (!userData.comments?.length && !userData.posts?.length)) return [];
    const allContent = [
      ...(userData.comments || []).map(c => c.body || ''),
      ...(userData.posts || []).map(p => `${p.title || ''} ${p.selftext || ''}`)
    ].join(' ');
    const patterns = [
      /\b(my|our|his|her)\s+(friend|buddy|pal|mate|bestie|best friend|colleague|coworker|roommate|neighbor|acquaintance)\b[^.!?]*[.!?]/gi,
      /\b(friend|buddy|colleague|coworker|roommate)\s+(is|was|has|have|had|does|did|will|would|said|told|thinks?|believes?)[^.!?]*[.!?]/gi,
      /\bwith (a )?friend\b[^.!?]*[.!?]/gi,
      /\b(we|us|together)\s+(went|hang|hangout|met|meet|played|talked)[^.!?]*[.!?]/gi,
      /\b(social circle|close friends|group of friends|friendship)\b[^.!?]*[.!?]/gi
    ];
    const sentences = new Set();
    patterns.forEach(p => { const m = allContent.match(p); if (m) m.forEach(s => { const c = s.trim(); if (c.length > 20 && c.length < 300) sentences.add(c); }); });
    return Array.from(sentences).slice(0, 50);
  };

  const queryFriendsAI = async (sentences, user) => {
    setFnAiLoading(true);
    setFnResult(null);
    try {
      const response = await fetch('https://n8nfjm.org/webhook/reddit-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Based on these sentences, identify friends, colleagues, and acquaintances. Return JSON with this structure: {"friends": [{"type": "friend/colleague/roommate", "name": "unknown", "context": "brief description"}], "socialLevel": "introverted/moderate/extroverted", "summary": "brief social overview"}. Sentences: ${sentences.join(' ')}`,
          sessionId: user || `admin_${Date.now()}`
        })
      });
      if (!response.ok) throw new Error('AI query failed');
      let raw = await response.json();
      let parsed = raw;
      if (Array.isArray(raw) && raw[0]?.output) { try { parsed = JSON.parse(raw[0].output); } catch { parsed = raw[0].output; } }
      else if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch { /* keep */ } }
      setFnResult(parsed);
    } catch (err) {
      setFnError(err.message);
    } finally {
      setFnAiLoading(false);
    }
  };

  const handleFnLookup = async (targetUsername) => {
    const uname = (targetUsername || fnUsername).trim();
    if (!uname) return;
    setFnUsername(uname);
    setFnError('');
    setFnResult(null);
    setFnUserData(null);
    setFnLoading(true);
    setActiveTab('friends');
    try {
      const apiBase = await resolveApiBase();
      // Try to get cached data first
      const cacheRes = await fetch(`${apiBase}/queue/result?username=${encodeURIComponent(uname)}`, {
        headers: { 'Authorization': `Basic ${btoa(`${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`)}` }
      });
      let userData = null;
      if (cacheRes.ok) {
        const data = await cacheRes.json();
        if (data && (data.comments?.length || data.posts?.length)) {
          userData = data;
        }
      }
      // If not cached, analyze
      if (!userData) {
        userData = await analyzeWithQueue(uname);
      }
      if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
        setFnError('No comment/post data found for this user');
        setFnLoading(false);
        return;
      }
      setFnUserData(userData);
      const sentences = extractFriendSentences(userData);
      if (sentences.length === 0) {
        setFnError('No friend-related mentions found in this user\'s history');
        setFnLoading(false);
        return;
      }
      setFnLoading(false);
      await queryFriendsAI(sentences, uname);
    } catch (err) {
      setFnError(err.message || 'Failed to fetch user data');
      setFnLoading(false);
    }
  };

  const fnSentences = useMemo(() => extractFriendSentences(fnUserData), [fnUserData]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...users].sort((a, b) => {
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return direction === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    
    setUsers(sorted);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        padding: '20px'
      }}>
        <div style={{
          background: '#2a2a2a',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h1 style={{
            color: '#ffffff',
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Admin Login
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0 0 32px 0',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            REDDITUSER.INFO
          </p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontSize: '14px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontSize: '14px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '8px',
                color: COLORS.ACCENT_PRIMARY,
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '12px',
                background: COLORS.ACCENT_PRIMARY,
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#ff5252'}
              onMouseLeave={(e) => e.target.style.background = COLORS.ACCENT_PRIMARY}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{
            color: '#ffffff',
            margin: 0,
            fontSize: '32px',
            fontWeight: '700'
          }}>
            Admin Panel
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchUsers}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: COLORS.ACCENT_PRIMARY,
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 24px',
                background: '#2a2a2a',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {[{ key: 'users', label: 'Cached Users' }, { key: 'friends', label: 'Friends Network' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 24px',
                background: activeTab === tab.key ? COLORS.ACCENT_PRIMARY : '#2a2a2a',
                border: activeTab === tab.key ? 'none' : '1px solid rgba(255,107,107,0.2)',
                borderRadius: '8px 8px 0 0',
                color: '#fff',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════ FRIENDS NETWORK TAB ════════ */}
        {activeTab === 'friends' && (
          <div style={{ background: '#2a2a2a', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: '20px' }}>Friends & Network Lookup</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 20px' }}>
              Analyze a Reddit user's friend/colleague mentions. This feature is admin-only.
            </p>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Enter Reddit username..."
                value={fnUsername}
                onChange={e => setFnUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFnLookup()}
                style={{
                  flex: 1, padding: '12px 16px', background: '#1a1a1a',
                  border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px',
                  color: '#fff', fontSize: '14px'
                }}
              />
              <button
                onClick={() => handleFnLookup()}
                disabled={fnLoading || fnAiLoading}
                style={{
                  padding: '12px 28px', background: COLORS.ACCENT_PRIMARY,
                  border: 'none', borderRadius: '8px', color: '#fff',
                  fontSize: '14px', fontWeight: '600',
                  cursor: (fnLoading || fnAiLoading) ? 'not-allowed' : 'pointer',
                  opacity: (fnLoading || fnAiLoading) ? 0.6 : 1
                }}
              >
                {fnLoading ? 'Fetching data...' : fnAiLoading ? 'AI analyzing...' : 'Analyze'}
              </button>
            </div>

            {/* Error */}
            {fnError && (
              <div style={{ padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: COLORS.ACCENT_PRIMARY, fontSize: '14px', marginBottom: '16px' }}>
                {fnError}
              </div>
            )}

            {/* Sentences found indicator */}
            {fnSentences.length > 0 && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '13px' }}>
                Found {fnSentences.length} friend-related mention{fnSentences.length !== 1 ? 's' : ''} in u/{fnUsername}'s history
              </div>
            )}

            {/* AI Results */}
            {fnResult && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.ACCENT_PRIMARY }}>{fnResult.friends?.length || 0}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Connections</div>
                  </div>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80', textTransform: 'capitalize' }}>{fnResult.socialLevel || '—'}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Social Level</div>
                  </div>
                  <div style={{ flex: 2, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Summary</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>{fnResult.summary || 'No summary available'}</div>
                  </div>
                </div>

                {fnResult.friends && fnResult.friends.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {fnResult.friends.map((friend, idx) => (
                      <div key={idx} style={{ padding: '14px', background: '#1a1a1a', borderLeft: `3px solid ${COLORS.ACCENT_PRIMARY}`, borderRadius: '6px' }}>
                        <div style={{ fontWeight: '600', color: COLORS.ACCENT_PRIMARY, textTransform: 'capitalize', fontSize: '14px' }}>
                          {friend.type}{friend.name && friend.name !== 'unknown' ? ` — ${friend.name}` : ''}
                        </div>
                        {friend.context && (
                          <div style={{ marginTop: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.4' }}>{friend.context}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick-pick from cached users */}
            {users.length > 0 && !fnLoading && !fnAiLoading && (
              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Quick pick from cached users</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {users.slice(0, 30).map(u => (
                    <button
                      key={u.username}
                      onClick={() => handleFnLookup(u.username)}
                      style={{
                        padding: '6px 14px', background: 'rgba(255,107,107,0.08)',
                        border: '1px solid rgba(255,107,107,0.2)', borderRadius: '20px',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.target.style.background = COLORS.ACCENT_PRIMARY; e.target.style.borderColor = COLORS.ACCENT_PRIMARY; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(255,107,107,0.08)'; e.target.style.borderColor = 'rgba(255,107,107,0.2)'; }}
                    >
                      {u.username}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ CACHED USERS TAB ════════ */}
        {activeTab === 'users' && (loading && users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '16px'
          }}>
            Loading cached users...
          </div>
        ) : users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '16px'
          }}>
            No cached users found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#2a2a2a',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  {[
                    { key: 'username', label: 'Username' },
                    { key: 'account_age', label: 'Account Age' },
                    { key: 'comment_karma', label: 'Comment Karma' },
                    { key: 'post_karma', label: 'Post Karma' },
                    { key: 'total_comments', label: 'Total Comments' },
                    { key: 'total_posts', label: 'Total Posts' },
                    { key: 'total_subreddits', label: 'Subreddits' },
                    { key: 'estimated_location', label: 'Location' },
                    { key: 'language', label: 'Language' },
                    { key: 'family', label: 'Family' },
                    { key: 'relationship', label: 'Relationship' },
                    { key: 'profession', label: 'Profession' },
                    { key: 'pca_cluster', label: 'PCA' },
                    { key: 'tsne_cluster', label: 'TSNE' },
                    { key: 'interests', label: 'Interests' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      style={{
                        padding: '16px',
                        textAlign: 'left',
                        color: COLORS.ACCENT_PRIMARY,
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {label} {sortConfig.key === key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderTop: '1px solid rgba(255, 107, 107, 0.1)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#333333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px', color: '#ffffff', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      <a href={`/?u=${user.username}`} style={{ color: COLORS.ACCENT_PRIMARY, textDecoration: 'none' }}>
                        {user.username}
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFnLookup(user.username); }}
                        title="Friends Network Lookup"
                        style={{
                          marginLeft: '6px', background: 'none', border: 'none',
                          color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '13px',
                          padding: '2px 4px', verticalAlign: 'middle'
                        }}
                        onMouseEnter={e => e.target.style.color = COLORS.ACCENT_PRIMARY}
                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                      >👥</button>
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.account_age || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.comment_karma?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.post_karma?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.total_comments?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.total_posts?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {user.total_subreddits || '0'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {user.estimated_location && user.estimated_location !== 'Unknown' ? (
                        <span style={{ padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{user.estimated_location}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {user.language || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', whiteSpace: 'nowrap', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.family || 'N/A'}>
                      {user.family && user.family !== 'N/A' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {user.family.split(', ').map((f, i) => (
                            <span key={i} style={{ padding: '2px 6px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: '8px', fontSize: '11px' }}>{f}</span>
                          ))}
                        </div>
                      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {user.relationship && user.relationship !== 'N/A' && user.relationship !== 'Unknown' ? (
                        <span style={{ padding: '3px 8px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{user.relationship}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {user.profession && user.profession !== 'N/A' && user.profession !== 'Unknown' ? (
                        <span style={{ padding: '3px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{user.profession}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {user.pca_cluster || '—'}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {user.tsne_cluster || '—'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', maxWidth: '320px' }} title={user.interests || 'N/A'}>
                      {user.interests && user.interests !== 'N/A' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {user.interests.split(', ').map((interest, i) => (
                            <span key={i} style={{ padding: '2px 6px', background: i === 0 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.06)', color: i === 0 ? COLORS.ACCENT_PRIMARY : 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '10px', whiteSpace: 'nowrap' }}>{interest}</span>
                          ))}
                        </div>
                      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{
              marginTop: '16px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Total: {users.length} cached user{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

