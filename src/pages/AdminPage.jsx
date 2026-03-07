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
  const [fnContacts, setFnContacts] = useState([]); // extracted usernames from responding field
  const [fnScraping, setFnScraping] = useState(null); // username currently being scraped
  const [fnQuickFilter, setFnQuickFilter] = useState(''); // filter for quick-pick list
  const [fnAutoScrapeEnabled, setFnAutoScrapeEnabled] = useState(false); // auto scrape contacts one by one
  const [fnAutoScrapeDelayMs, setFnAutoScrapeDelayMs] = useState(1000); // delay between auto scrapes

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
  // Extract unique usernames from comments[].responding field
  const extractContacts = (userData) => {
    if (!userData?.comments?.length) return [];
    const counts = {};
    const subreddits = {};
    for (const c of userData.comments) {
      // Use responding (resolved parent author) if available, otherwise fall back to link_author (post OP)
      const who = c.responding || c.link_author;
      if (!who || who === '[deleted]' || who === '[removed]' || who === userData.username) continue;
      counts[who] = (counts[who] || 0) + 1;
      if (c.subreddit) {
        if (!subreddits[who]) subreddits[who] = {};
        subreddits[who][c.subreddit] = (subreddits[who][c.subreddit] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        subreddits: Object.entries(subreddits[name] || {})
          .sort((a, b) => b[1] - a[1])
          .map(([s, n]) => `${s} (${n})`)
          .slice(0, 5),
        isCached: users.some(u => u.username.toLowerCase() === name.toLowerCase())
      }))
      .sort((a, b) => b.count - a.count);
  };

  const handleFnLookup = async (targetUsername) => {
    const uname = (targetUsername || fnUsername).trim();
    if (!uname) return;
    setFnUsername(uname);
    setFnError('');
    setFnContacts([]);
    setFnUserData(null);
    setFnLoading(true);
    setActiveTab('friends');
    try {
      const userData = await analyzeWithQueue({ username: uname });
      if (!userData || (!userData.comments?.length && !userData.posts?.length)) {
        setFnError('No comment/post data found for this user');
        setFnLoading(false);
        return;
      }
      setFnUserData(userData);
      const contacts = extractContacts(userData);
      setFnContacts(contacts);
      if (contacts.length === 0) {
        setFnError('No user interactions found in scraped data');
      }
      setFnLoading(false);
    } catch (err) {
      setFnError(err.message || 'Failed to fetch user data');
      setFnLoading(false);
    }
  };

  // Scrape a contact user (add to DB) then refresh cached users
  const handleScrapeContact = async (contactUsername) => {
    setFnScraping(contactUsername);
    try {
      await analyzeWithQueue({ username: contactUsername });
      await fetchUsers(); // refresh cached users list
      // update isCached on contacts
      setFnContacts(prev => prev.map(c =>
        c.name.toLowerCase() === contactUsername.toLowerCase() ? { ...c, isCached: true } : c
      ));
    } catch (err) {
      console.error('Failed to scrape:', contactUsername, err);
    } finally {
      setFnScraping(null);
    }
  };

  useEffect(() => {
    if (!fnAutoScrapeEnabled) return;
    if (activeTab !== 'friends') return;
    if (fnLoading || fnScraping) return;

    const nextContact = fnContacts.find(c => !c.isCached);
    if (!nextContact) return;

    const timer = setTimeout(() => {
      handleScrapeContact(nextContact.name);
    }, Math.max(0, fnAutoScrapeDelayMs));

    return () => clearTimeout(timer);
  }, [fnAutoScrapeEnabled, activeTab, fnLoading, fnScraping, fnContacts, fnAutoScrapeDelayMs]);

  const fnSentences = useMemo(() => extractContacts(fnUserData), [fnUserData, users]);


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
            <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: '20px' }}>User Contacts &amp; Scrape Discovery</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 20px' }}>
              Select or search a user to see all Reddit usernames they've interacted with (from scraped data). Then scrape those contacts to grow the DB.
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
                disabled={fnLoading}
                style={{
                  padding: '12px 28px', background: COLORS.ACCENT_PRIMARY,
                  border: 'none', borderRadius: '8px', color: '#fff',
                  fontSize: '14px', fontWeight: '600',
                  cursor: fnLoading ? 'not-allowed' : 'pointer',
                  opacity: fnLoading ? 0.6 : 1
                }}
              >
                {fnLoading ? 'Fetching...' : 'Load Contacts'}
              </button>
            </div>

            {fnContacts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>
                    Pending auto-scrape: <span style={{ color: '#fff', fontWeight: '600' }}>{fnContacts.filter(c => !c.isCached).length}</span>
                  </div>
                  <select
                    value={fnAutoScrapeDelayMs}
                    onChange={e => setFnAutoScrapeDelayMs(Number(e.target.value))}
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      padding: '6px 8px'
                    }}
                  >
                    <option value={0}>Delay: 0s</option>
                    <option value={1000}>Delay: 1s</option>
                    <option value={3000}>Delay: 3s</option>
                    <option value={5000}>Delay: 5s</option>
                  </select>
                </div>
                <button
                  onClick={() => setFnAutoScrapeEnabled(prev => !prev)}
                  disabled={fnContacts.filter(c => !c.isCached).length === 0}
                  style={{
                    padding: '8px 14px',
                    background: fnAutoScrapeEnabled ? '#16a34a' : '#3b3b3b',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: fnContacts.filter(c => !c.isCached).length === 0 ? 'not-allowed' : 'pointer',
                    opacity: fnContacts.filter(c => !c.isCached).length === 0 ? 0.5 : 1
                  }}
                >
                  {fnAutoScrapeEnabled
                    ? (fnScraping ? `Auto Scraper ON • Scraping ${fnScraping}` : `Auto Scraper ON • ${Math.round(fnAutoScrapeDelayMs / 1000)}s delay`)
                    : 'Auto Scraper OFF'}
                </button>
              </div>
            )}

            {/* Error */}
            {fnError && (
              <div style={{ padding: '12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: COLORS.ACCENT_PRIMARY, fontSize: '14px', marginBottom: '16px' }}>
                {fnError}
              </div>
            )}

            {/* Results */}
            {fnContacts.length > 0 && (
              <div>
                {/* Stats bar */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.ACCENT_PRIMARY }}>{fnContacts.length}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Unique Contacts</div>
                  </div>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>{fnContacts.filter(c => c.isCached).length}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Already Scraped</div>
                  </div>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>{fnContacts.filter(c => !c.isCached).length}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>New (Not Scraped)</div>
                  </div>
                  <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#60a5fa' }}>{fnContacts.reduce((s, c) => s + c.count, 0)}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Total Interactions</div>
                  </div>
                </div>

                {/* Contacts table */}
                <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#111' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: COLORS.ACCENT_PRIMARY, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', color: COLORS.ACCENT_PRIMARY, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Replies</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: COLORS.ACCENT_PRIMARY, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subreddits</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', color: COLORS.ACCENT_PRIMARY, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', color: COLORS.ACCENT_PRIMARY, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fnContacts.map((contact, idx) => (
                        <tr key={contact.name} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#222'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 16px', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                            u/{contact.name}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' }}>
                            {contact.count}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {contact.subreddits.map((s, i) => (
                                <span key={i} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            {contact.isCached ? (
                              <span style={{ padding: '3px 10px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>In DB</span>
                            ) : (
                              <span style={{ padding: '3px 10px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>New</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              {!contact.isCached && (
                                <button
                                  onClick={() => handleScrapeContact(contact.name)}
                                  disabled={fnScraping !== null}
                                  title="Scrape this user into DB"
                                  style={{
                                    padding: '4px 12px', background: COLORS.ACCENT_PRIMARY, border: 'none',
                                    borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600',
                                    cursor: fnScraping ? 'not-allowed' : 'pointer',
                                    opacity: fnScraping === contact.name ? 0.5 : 1
                                  }}
                                >
                                  {fnScraping === contact.name ? '⏳ Scraping...' : 'Scrape'}
                                </button>
                              )}
                              <button
                                onClick={() => handleFnLookup(contact.name)}
                                disabled={fnLoading}
                                title="View this user's contacts"
                                style={{
                                  padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: '6px', color: '#fff', fontSize: '12px',
                                  cursor: fnLoading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                👥 Contacts
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick-pick from cached users */}
            {users.length > 0 && !fnLoading && fnContacts.length === 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Quick pick from cached users ({users.length})</h3>
                  <input
                    type="text"
                    placeholder="Filter users..."
                    value={fnQuickFilter}
                    onChange={e => setFnQuickFilter(e.target.value)}
                    style={{
                      padding: '6px 12px', background: '#1a1a1a',
                      border: '1px solid rgba(255,107,107,0.2)', borderRadius: '16px',
                      color: '#fff', fontSize: '12px', width: '180px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {users
                    .filter(u => !fnQuickFilter || u.username.toLowerCase().includes(fnQuickFilter.toLowerCase()))
                    .sort((a, b) => a.username.localeCompare(b.username))
                    .map(u => (
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

