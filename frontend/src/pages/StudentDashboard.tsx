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

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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

  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      display: 'flex',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar */}
      <div 
        style={{
          width: (sidebarCollapsed && !sidebarHovered) ? '80px' : (sidebarHovered ? '280px' : '280px'),
          backgroundColor: '#1a1a1a',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
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

        {/* Burger Button - Always visible when collapsed, hide only when expanded and not hovered */}
        
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
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
                margin: 0, 
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
            backgroundColor: '#ff6b35',
            borderLeft: (sidebarCollapsed && !sidebarHovered) ? 'none' : '4px solid #e55a2b',
            cursor: 'pointer',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            transition: 'all 0.3s ease',
            fontWeight: 'bold'
          }}>
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
            {!(sidebarCollapsed && !sidebarHovered) && "Profile"}
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
            }}
          >
            <>
              <FontAwesomeIcon icon={faArrowAltCircleRight} />
              {!(sidebarCollapsed && !sidebarHovered) && " Logout"}
            </>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px 30px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#2c3e50' }}>
              Student Dashboard
            </h1>
            <p style={{ margin: '5px 0 0', color: '#6c757d' }}>
              DDNGAL GREETINGSNGAL GREETINGS!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
            <>
              <FontAwesomeIcon icon={faGear} />
            </>
            </button>
            <div style={{
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  weekday: "long",
                })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '30px' }}>
          {/* Password Change Alert */}
          {userInfo?.needsPasswordChange && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '15px 20px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#856404' }}>Password Change Required</strong>
                <p style={{ margin: '5px 0 0', color: '#856404', fontSize: '14px' }}>
                  You're using the default password. Please change your password for security.
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Change Now
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '25px',
            marginBottom: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #3498db'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '10px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Program
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '5px'
              }}>
                {student?.program}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Current Program
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #27ae60'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '10px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Year Level
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '5px'
              }}>
                {student?.year_level}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Current Year
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #f39c12'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '10px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Status
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '5px'
              }}>
                {student?.status === 'active' ? 'Enrolled' : 'Not Enrolled'}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Enrollment Status
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #e74c3c'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '10px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                Email
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#2c3e50',
                marginBottom: '5px',
                wordBreak: 'break-all'
              }}>
                {student?.email}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Contact Email
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ 
              margin: '0 0 20px', 
              fontSize: '20px', 
              color: '#2c3e50',
              borderBottom: '2px solid #f39c12',
              paddingBottom: '10px'
            }}>
              📢 Announcements
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                borderLeft: '4px solid #f39c12',
                border: '1px solid #ffeaa7'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#856404', 
                  marginBottom: '8px',
                  fontSize: '16px'
                }}>
                  📚 Midterm Examination Schedule
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#856404', 
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  Midterm examinations will start next week. Please check your examination schedule and prepare accordingly. Examination rooms will be posted on the bulletin board.
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#856404',
                  fontWeight: '500'
                }}>
                  Posted: 2 days ago • Academic Affairs
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#d1ecf1',
                borderRadius: '8px',
                borderLeft: '4px solid #17a2b8',
                border: '1px solid #bee5eb'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#0c5460', 
                  marginBottom: '8px',
                  fontSize: '16px'
                }}>
                  📝 Assignment Deadline Reminder
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#0c5460', 
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  All pending assignments for Mathematics and Science courses must be submitted by Friday, 11:59 PM. Late submissions will not be accepted.
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#0c5460',
                  fontWeight: '500'
                }}>
                  Posted: 1 day ago • Faculty of Sciences
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#d4edda',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745',
                border: '1px solid #c3e6cb'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#155724', 
                  marginBottom: '8px',
                  fontSize: '16px'
                }}>
                  🎉 Student Achievement Recognition
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#155724', 
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  Congratulations to all students who participated in the recent Science Fair! Award ceremony will be held on Friday at the main auditorium.
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#155724',
                  fontWeight: '500'
                }}>
                  Posted: 3 days ago • Student Services
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 20px', 
              fontSize: '20px', 
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '10px'
            }}>
              📋 Recent Activities
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '3px solid #3498db'
              }}>
                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                  📚 Course Registration
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  Successfully registered for current semester courses
                </div>
                <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '5px' }}>
                  2 days ago
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '3px solid #27ae60'
              }}>
                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                  📅 Attendance Record
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  Marked present for today's classes
                </div>
                <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '5px' }}>
                  Today
                </div>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '3px solid #f39c12'
              }}>
                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                  📝 Assignment Submitted
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  Submitted Mathematics Assignment #3
                </div>
                <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '5px' }}>
                  1 week ago
                </div>
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

export default StudentDashboard;
