import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CogIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../components/ToastProvider';

interface Faculty {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  specialization: string;
  status: string;
  total_students: number;
  courses_assigned: number;
  office_hours: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  schedule: string;
  room: string;
  students: number;
  status: string;
}

interface Schedule {
  id: string;
  course_code: string;
  course_name: string;
  time: string;
  room: string;
  type: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: string;
}

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Check if user is authenticated as faculty
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'faculty') {
      navigate('/login');
      return;
    }

    // Fetch faculty data from backend
    
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        
        // Get user info from localStorage
        const user = localStorage.getItem('user');
        if (!user) {
          navigate('/login');
          return;
        }
        
        const userData = JSON.parse(user);
        
        // Use the actual logged-in user's data
        const facultyData: Faculty = {
          id: userData.id || '1',
          first_name: userData.first_name || 'Unknown',
          last_name: userData.last_name || 'User',
          email: userData.email || 'unknown@pnc.edu.ph',
          department: userData.department || 'Computer Studies',
          specialization: userData.specialization || 'Software Engineering',
          status: userData.status || 'active',
          total_students: 0, // Will be calculated below
          courses_assigned: 0, // Will be calculated below
          office_hours: '9:00 AM - 11:00 AM' // Default, can be updated from backend
        };
        
        setFaculty(facultyData);
        
        // For now, use mock courses data based on logged-in user
        const mockCourses: Course[] = [
          { id: '1', code: 'IT101', name: 'Introduction to Information Technology', students: 25, schedule: 'MWF 8:00-9:00 AM', room: 'Room 101', status: 'active' },
          { id: '2', code: 'IT103', name: 'Programming Fundamentals', students: 20, schedule: 'TTH 10:00-11:30 AM', room: 'Room 202', status: 'active' },
        ];
        setCourses(mockCourses);
        
        // Mock schedule data
        const mockSchedule: Schedule[] = [
          { id: '1', course_code: 'IT101', course_name: 'Introduction to Information Technology', time: '8:00-9:00 AM', room: 'Room 101', type: 'Lecture' },
          { id: '2', course_code: 'IT103', course_name: 'Programming Fundamentals', time: '10:00-11:30 AM', room: 'Room 202', type: 'Lab' },
        ];
        setSchedule(mockSchedule);
        
        // Mock announcements
        const mockAnnouncements: Announcement[] = [
          { id: '1', title: 'Faculty Meeting', message: 'Monthly faculty meeting scheduled for next Friday', date: '2024-03-15', priority: 'high' },
          { id: '2', title: 'Course Updates', message: 'Please update your course syllabus for new semester', date: '2024-03-10', priority: 'medium' },
        ];
        setAnnouncements(mockAnnouncements);
        
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePasswordChange = (newPassword: string) => {
    // In a real app, this would update the password in the database
    console.log('Password changed for faculty:', faculty?.email);
    console.log('New password:', newPassword);
    
    toast.success('Password changed successfully!');
    setShowPasswordModal(false);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify(user));
  };

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
            zIndex: 1000
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
            {(sidebarCollapsed && !sidebarHovered) ? faculty?.first_name?.[0] : `${faculty?.first_name?.[0]}${faculty?.last_name?.[0]}`}
          </div>
          {!(sidebarCollapsed && !sidebarHovered) && (
            <>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                {faculty?.first_name} {faculty?.last_name}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#bdc3c7',
                marginBottom: '10px'
              }}>
                {faculty?.email}
              </p>
              <span style={{
                backgroundColor: faculty?.status === 'active' ? '#ff6b35' : '#e74c3c',
                color: faculty?.status === 'active' ? '#ffffff' : '#ffffff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {faculty?.status === 'active' ? 'Active' : 'Inactive'}
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
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ChartBarIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Dashboard"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-subjects')}
          >
            <BookOpenIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " My Courses"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-schedule')}
          >
            <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Schedule"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-students')}
          >
            <UserGroupIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Students"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-leave-requests')}
          >
            <DocumentTextIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Leave Requests"}
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
              justifyContent: 'center',
              gap: '10px'
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
        display: 'flex', 
        flexDirection: 'column', 
        marginLeft: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px', 
        transition: 'margin-left 0.3s ease' 
      }}>
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
              Faculty Dashboard
            </h1>
            <p style={{ margin: '5px 0 0', color: '#6c757d' }}>
              Welcome back, {faculty?.first_name}!
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <CogIcon style={{ width: '16px', height: '16px' }} />
              Settings
            </button>
            <div style={{
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {faculty?.email}
            </div>
          </div>
        </div>

        {/* Password Change Alert */}
        {faculty?.email === 'rrgarcia@pnc.edu.ph' && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px 20px',
            margin: '20px 30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ExclamationCircleIcon style={{ width: '20px', height: '20px', color: '#f39c12' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#856404' }}>Default Password:</strong> You are using the default password. Please change it for security.
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Change Password
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={{ padding: '30px', flex: 1 }}>
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
              borderLeft: '4px solid #ff6b35'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <UserGroupIcon style={{ width: '30px', height: '30px', color: '#ffffff' }} />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#ffffff', 
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  Active
                </span>
              </div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#2c3e50' }}>
                {faculty?.total_students}
              </h3>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                Total Students
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #3498db'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <BookOpenIcon style={{ width: '30px', height: '30px', color: '#3498db' }} />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#ffffff', 
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  Active
                </span>
              </div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#2c3e50' }}>
                {faculty?.courses_assigned}
              </h3>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                Courses Assigned
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #f39c12'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <ClockIcon style={{ width: '30px', height: '30px', color: '#f39c12' }} />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#ffffff', 
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  Active
                </span>
              </div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#2c3e50' }}>
                {faculty?.office_hours}
              </h3>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                Office Hours
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #27ae60'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <AcademicCapIcon style={{ width: '30px', height: '30px', color: '#27ae60' }} />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#ffffff', 
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  Active
                </span>
              </div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#2c3e50' }}>
                {faculty?.specialization}
              </h3>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                Specialization
              </p>
            </div>
          </div>

          {/* Courses and Schedule */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* My Courses */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '18px' }}>
                  My Courses (Assigned by Admin)
                </h2>
                <span style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {courses.length} courses assigned
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {courses.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <BookOpenIcon style={{ width: '40px', height: '40px', color: '#ffffff', marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      No Courses Assigned Yet
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      Admin hasn't assigned any courses to you yet. Please check back later.
                    </p>
                  </div>
                ) : (
                  courses.map(course => (
                    <div key={course.id} style={{
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '14px' }}>
                          {course.code} - {course.name}
                        </h4>
                        <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
                          {course.schedule} • {course.room}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: '#ffffff',
                        backgroundColor: '#ff6b35',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Schedule */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '18px' }}>
                  Today's Schedule (Admin Approved)
                </h2>
                <span style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  backgroundColor: '#ff6b35',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {schedule.length} classes today
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {schedule.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <CalendarDaysIcon style={{ width: '40px', height: '40px', color: '#ffffff', marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      No Schedule Available Yet
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      Admin hasn't approved your teaching schedule yet. Please check back later.
                    </p>
                  </div>
                ) : (
                  schedule.map(item => (
                    <div key={item.id} style={{
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '14px' }}>
                          {item.course_code}
                        </h4>
                        <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
                          {item.course_name}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: '#ffffff',
                        backgroundColor: '#ff6b35',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Announcements */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px' }}>
                Announcements
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {announcements.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <ExclamationCircleIcon style={{ width: '40px', height: '40px', color: '#ffffff', marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      No Announcements Yet
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      Admin hasn't posted any announcements yet. Check back later for updates.
                    </p>
                  </div>
                ) : (
                  announcements.map(announcement => {
                    const borderColor = announcement.priority === 'high' ? '#f39c12' : 
                                           announcement.priority === 'medium' ? '#17a2b8' : '#28a745';
                    const bgColor = announcement.priority === 'high' ? '#fff3cd' : 
                                     announcement.priority === 'medium' ? '#d1ecf1' : '#d4edda';
                    
                    return (
                      <div key={announcement.id} style={{
                        padding: '15px',
                        backgroundColor: bgColor,
                        borderRadius: '8px',
                        borderLeft: `4px solid ${borderColor}`,
                        border: '1px solid ' + (announcement.priority === 'high' ? '#ffeaa7' : 
                                          announcement.priority === 'medium' ? '#bee5eb' : '#c3e6cb')
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '14px' }}>
                              {announcement.title}
                            </h4>
                            <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
                              {announcement.message}
                            </p>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color: '#6c757d',
                            marginLeft: '10px'
                          }}>
                            {announcement.date}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '30px',
              width: '400px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                Change Password
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#6c757d', fontSize: '14px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#6c757d', fontSize: '14px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handlePasswordChange('newpassword')}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
