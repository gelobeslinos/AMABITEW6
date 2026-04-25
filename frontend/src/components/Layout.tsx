import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

// Navigation grouped by category
const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Employees', href: '/employees', icon: UserGroupIcon },
      { name: 'Students', href: '/students', icon: AcademicCapIcon },
      { name: 'Student Profiling', href: '/student-profiling', icon: UserCircleIcon },
    ],
  },
  {
    label: 'Academics',
    items: [
      { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
      { name: 'Curriculum', href: '/curriculum', icon: BuildingOfficeIcon },
      { name: 'Deployments', href: '/deployments', icon: RocketLaunchIcon },
    ],
  },
  {
    label: 'HR',
    items: [
      { name: 'Attendance', href: '/attendance', icon: CalendarDaysIcon },
      { name: 'Leave Requests', href: '/leave-requests', icon: DocumentTextIcon },
    ],
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();
  const isExpanded = isMobile ? mobileMenuOpen : !sidebarCollapsed;
  const sidebarWidth = isExpanded ? 260 : 72;

  const getRoleBadge = () => {
    const role = userInfo?.role;
    if (role === 'master') return 'Master Admin';
    if (role === 'dean') return 'Dean';
    if (role === 'deptchair') return 'Dept Chair';
    if (role === 'faculty') return 'Faculty';
    return 'Administrator';
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>

      {/* ── Mobile overlay backdrop ── */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            zIndex: 998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Mobile hamburger button ── */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            boxShadow: '0 4px 14px rgba(255,107,53,0.45)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {mobileMenuOpen
            ? <XMarkIcon style={{ width: '22px', height: '22px' }} />
            : <Bars3Icon style={{ width: '22px', height: '22px' }} />}
        </button>
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
          color: 'white',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          overflow: 'hidden',
        }}
      >
        {/* ── Logo / Brand ── */}
        <div style={{
          padding: isExpanded ? '20px 20px 16px' : '20px 12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,107,53,0.04) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative corner */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '50px', height: '50px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.25) 0%, transparent 100%)',
            borderRadius: '0 0 0 50px',
          }} />
          <img
            src="/1.jpg"
            alt="CCS Logo"
            style={{
              width: isExpanded ? '42px' : '36px',
              height: isExpanded ? '42px' : '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #ff6b35',
              boxShadow: '0 0 0 4px rgba(255,107,53,0.18)',
              flexShrink: 0,
              transition: 'all 0.35s ease',
            }}
          />
          {isExpanded && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                CCS Portal
              </div>
              <div style={{ fontSize: '11px', color: '#ff6b35', fontWeight: '500', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                College of Computing Studies
              </div>
            </div>
          )}

          {/* Desktop collapse toggle */}
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                marginLeft: 'auto',
                width: '26px',
                height: '26px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,107,53,0.2)';
                e.currentTarget.style.color = '#ff6b35';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed
                ? <ChevronRightIcon style={{ width: '14px', height: '14px' }} />
                : <ChevronLeftIcon style={{ width: '14px', height: '14px' }} />}
            </button>
          )}
        </div>

        {/* ── User Profile ── */}
        <div style={{
          padding: isExpanded ? '16px 20px' : '16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          background: 'rgba(99,102,241,0.05)',
        }}>
          <div style={{
            width: isExpanded ? '40px' : '36px',
            height: isExpanded ? '40px' : '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isExpanded ? '15px' : '13px',
            fontWeight: '700',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            border: '2px solid rgba(255,255,255,0.15)',
            transition: 'all 0.35s ease',
          }}>
            {userInfo?.name?.substring(0, 2)?.toUpperCase() || 'AD'}
          </div>
          {isExpanded && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#f1f5f9',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {userInfo?.name || 'Admin User'}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '4px',
                background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}>
                <div style={{
                  width: '5px', height: '5px',
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }} />
                {getRoleBadge()}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        }}>
          {navigationGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              {/* Group label */}
              {isExpanded && (
                <div style={{
                  padding: '8px 20px 4px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {group.label}
                </div>
              )}
              {!isExpanded && (
                <div style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.06)',
                  margin: '8px 12px 4px',
                }} />
              )}

              {group.items.map((item, idx) => {
                const isActive = location.pathname === item.href ||
                  (item.href === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                    title={!isExpanded ? item.name : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: isExpanded ? '10px 20px' : '10px 18px',
                      margin: '2px 8px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      background: isActive
                        ? 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)'
                        : 'transparent',
                      boxShadow: isActive ? '0 4px 14px rgba(255,107,53,0.35)' : 'none',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '14px',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      animation: `slideIn 0.3s ease ${idx * 0.04}s both`,
                      justifyContent: isExpanded ? 'flex-start' : 'center',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,107,53,0.12)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isActive
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.25s ease',
                    }}>
                      <item.icon style={{
                        width: '17px',
                        height: '17px',
                        color: isActive ? '#ffffff' : '#ff6b35',
                      }} />
                    </div>
                    {isExpanded && (
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </span>
                    )}
                    {isActive && isExpanded && (
                      <div style={{
                        width: '6px', height: '6px',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '50%',
                        flexShrink: 0,
                        animation: 'pulse 2s infinite',
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div style={{
          padding: isExpanded ? '16px 16px' : '16px 10px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          background: 'rgba(239,68,68,0.04)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: isExpanded ? '11px 16px' : '11px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)';
            }}
          >
            <div style={{
              width: '28px', height: '28px',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ArrowRightOnRectangleIcon style={{ width: '16px', height: '16px' }} />
            </div>
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : `${sidebarWidth}px`,
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)',
        paddingTop: isMobile ? '72px' : '0',
        overflowX: 'hidden',
      }}>
        {children}
      </main>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Layout;
