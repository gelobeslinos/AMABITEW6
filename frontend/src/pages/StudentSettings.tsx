import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBook, faChartLine, faGear, faPercent, faUser } from "@fortawesome/free-solid-svg-icons";
import { faBarChart } from "@fortawesome/free-solid-svg-icons";
import { studentService } from '../services/api';
import { useToast } from '../components/ToastProvider';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  year_level: number;
  program: string;
  date_enrolled: string;
  status: string;
}

const StudentSettings: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    const getUserInfo = () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    };

    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchStudentData(userInfo.studentId);
  }, [navigate]);

  const fetchStudentData = async (studentId: number) => {
    try {
      const students = await studentService.getAll();
      const studentData = students.find(s => s.id === studentId);
      
      if (studentData) {
        setStudent(studentData);
      } else {
        console.error('Student not found');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newPassword.trim()) errors.newPassword = 'New password is required';
    if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      console.log('Password changed for student:', student?.student_id);
      console.log('New password:', newPassword);
      
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.needsPasswordChange = false;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ general: 'Failed to change password. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ff6b35',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

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
            {(sidebarCollapsed && !sidebarHovered) ? student?.first_name?.[0] : `${student?.first_name?.[0]}${student?.last_name?.[0]}`}
          </div>
          {!(sidebarCollapsed && !sidebarHovered) && (
            <>
              <h3 style={{ margin: '0 0 5px', fontSize: '18px' }}>
                {student?.full_name}
              </h3>
              <p style={{ 
                margin: '0', 
                fontSize: '14px', 
                color: '#bdc3c7',
                marginBottom: '10px'
              }}>
                {student?.student_id}
              </p>
              <span style={{
                backgroundColor: student?.status === 'active' ? '#ff6b35' : '#e74c3c',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {student?.status === 'active' ? 'Enrolled' : 'Not Enrolled'}
              </span>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={handleBackToDashboard}
          >
            <>
              <FontAwesomeIcon icon={faBarChart} />
              {!(sidebarCollapsed && !sidebarHovered) && " Dashboard"}
            </>
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/student-profile')}
          >
            <>
              <FontAwesomeIcon icon={faUser} />
              {!(sidebarCollapsed && !sidebarHovered) && " Profile"}
            </>
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/student-subjects')}
          >
            <>
              <FontAwesomeIcon icon={faBook} />
              {!(sidebarCollapsed && !sidebarHovered) && " Subject"}
            </>
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/student-assignments')}
          >
            <>
              <FontAwesomeIcon icon={faChartLine} />
              {!(sidebarCollapsed && !sidebarHovered) && " Assignments"}
            </>
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/student-grades')}
          >
            <>
              <FontAwesomeIcon icon={faPercent} />
              {!(sidebarCollapsed && !sidebarHovered) && " Grades"}
            </>
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            backgroundColor: '#ff6b35',
            borderLeft: (sidebarCollapsed && !sidebarHovered) ? 'none' : '4px solid #e55a2b',
            cursor: 'pointer',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            transition: 'all 0.3s ease',
            fontWeight: 'bold'
          }}>
            <>
              <FontAwesomeIcon icon={faGear} />
              {!(sidebarCollapsed && !sidebarHovered) && " Settings"}
            </>
          </div>
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
            {sidebarCollapsed ? '🚪' : 'Logout'}
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
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <button
                onClick={handleBackToDashboard}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a2b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
              >
                <FontAwesomeIcon icon={faArrowAltCircleRight} />
                Back to Dashboard
              </button>
              <h1 style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FontAwesomeIcon icon={faGear} />
                Settings
              </h1>
            </div>
          </div>

          {/* Settings Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {/* Account Settings */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2c3e50',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                🔐 Account Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a2b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
                >
                  🔑 Change Password
                </button>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                >
                  📧 Update Email
                </button>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                >
                  📱 Update Phone
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2c3e50',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                🔒 Privacy Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    Profile Visibility
                  </span>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#ff6b35',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    Email Notifications
                  </span>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#ff6b35',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    SMS Notifications
                  </span>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#ccc',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2c3e50',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                ⚙️ System Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    Dark Mode
                  </span>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#ccc',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ fontSize: '14px', color: '#2c3e50' }}>
                    Auto-save
                  </span>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '24px'
                  }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#ff6b35',
                      transition: '.4s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#ffc107',
                    color: '#2c3e50',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                >
                  🗑️ Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🔐 Change Password
            </h3>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: passwordErrors.newPassword ? '1px solid #e74c3c' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {passwordErrors.newPassword && (
                  <div style={{
                    color: '#e74c3c',
                    fontSize: '12px',
                    marginTop: '5px'
                  }}>
                    {passwordErrors.newPassword}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: passwordErrors.confirmPassword ? '1px solid #e74c3c' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {passwordErrors.confirmPassword && (
                  <div style={{
                    color: '#e74c3c',
                    fontSize: '12px',
                    marginTop: '5px'
                  }}>
                    {passwordErrors.confirmPassword}
                  </div>
                )}
              </div>

              {passwordErrors.general && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '20px',
                  color: '#721c24',
                  fontSize: '14px'
                }}>
                  {passwordErrors.general}
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordErrors({});
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSettings;
