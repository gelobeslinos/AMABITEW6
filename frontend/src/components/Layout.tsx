import React, { useState } from 'react';
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
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Students', href: '/students', icon: UserGroupIcon },
  { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
  { name: 'Curriculum', href: '/curriculum', icon: AcademicCapIcon },
  { name: 'Deployments', href: '/deployments', icon: AcademicCapIcon },
  { name: 'Attendance', href: '/attendance', icon: CalendarDaysIcon },
  { name: 'Leave Requests', href: '/leave-requests', icon: DocumentTextIcon },
  { name: 'Student Profiling', href: '/student-profiling', icon: UserCircleIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Check if user is authenticated
  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();

  return (
    <div style={{ 
      display: 'flex',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar */}
      <div 
        style={{
          width: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 999
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '20px',
          textAlign: 'center',
          borderBottom: '1px solid #34495e',
          transition: 'padding 0.3s ease'
        }}>
          <img 
            src="/1.jpg" 
            alt="CCS Logo" 
            style={{
              width: (sidebarCollapsed && !sidebarHovered) ? '30px' : '50px',
              height: (sidebarCollapsed && !sidebarHovered) ? '30px' : '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: (sidebarCollapsed && !sidebarHovered) ? '1px solid #ff6b35' : '2px solid #ff6b35',
              marginBottom: '10px',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Burger Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '-15px',
            width: '30px',
            height: '30px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        {/* Profile Section */}
        <div style={{
          padding: (sidebarCollapsed && !sidebarHovered) ? '20px 10px' : '30px 20px',
          borderBottom: '1px solid #34495e',
          textAlign: 'center',
          transition: 'padding 0.3s ease'
        }}>
          <div style={{
            width: (sidebarCollapsed && !sidebarHovered) ? '40px' : '80px',
            height: (sidebarCollapsed && !sidebarHovered) ? '40px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            fontSize: (sidebarCollapsed && !sidebarHovered) ? '16px' : '32px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            {(sidebarCollapsed && !sidebarHovered) ? userInfo?.name?.[0] || 'A' : userInfo?.name?.substring(0, 2) || 'AD'}
          </div>
          {!(sidebarCollapsed && !sidebarHovered) && (
            <>
              <h3 style={{ margin: '0 0 5px', fontSize: '18px' }}>
                {userInfo?.name || 'Admin User'}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                color: '#bdc3c7',
                marginBottom: '10px'
              }}>
                {userInfo?.email || 'admin@pnc.edu.ph'}
              </p>
              <span style={{
                backgroundColor: '#ff6b35',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {userInfo?.role === 'master' ? 'Master' : 'Admin'}
              </span>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                style={{
                  padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
                  backgroundColor: isActive ? '#ff6b35' : 'transparent',
                  borderLeft: isActive && !(sidebarCollapsed && !sidebarHovered) ? '4px solid #e55a2b' : 'none',
                  cursor: 'pointer',
                  textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#ff6b35';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon style={{ width: '20px', height: '20px' }} />
                {!(sidebarCollapsed && !sidebarHovered) && item.name}
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div style={{ padding: (sidebarCollapsed && !sidebarHovered) ? '20px 10px' : '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: (sidebarCollapsed && !sidebarHovered) ? '10px' : '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: (sidebarCollapsed && !sidebarHovered) ? '12px' : '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
