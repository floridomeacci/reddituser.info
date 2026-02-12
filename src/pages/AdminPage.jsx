import { useState, useEffect } from 'react';
import { resolveApiBase } from '../lib/apiClient';
import { COLORS } from '../design-tokens';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
            Cached Users Admin
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

        {loading && users.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}
