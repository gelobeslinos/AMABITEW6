import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBook, faChartLine, faGear, faPercent, faUser } from "@fortawesome/free-solid-svg-icons";
import { faBarChart } from "@fortawesome/free-solid-svg-icons";
import { studentService } from '../services/api';

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

interface Grade {
  id: number;
  subject: string;
  subjectCode: string;
  midterm: number;
  final: number;
  assignment: number;
  quiz: number;
  overall: number;
  status: 'passed' | 'failed' | 'incomplete';
}

const StudentGrades: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
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
        fetchGrades();
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

  const fetchGrades = async () => {
    try {
      // Mock grades data
      const mockGrades: Grade[] = [
        {
          id: 1,
          subject: 'Introduction to Information Technology',
          subjectCode: 'IT101',
          midterm: 85,
          final: 88,
          assignment: 92,
          quiz: 90,
          overall: 88.75,
          status: 'passed'
        },
        {
          id: 2,
          subject: 'Computer Fundamentals',
          subjectCode: 'IT102',
          midterm: 78,
          final: 82,
          assignment: 85,
          quiz: 80,
          overall: 81.25,
          status: 'passed'
        },
        {
          id: 3,
          subject: 'Programming Fundamentals',
          subjectCode: 'IT103',
          midterm: 92,
          final: 90,
          assignment: 88,
          quiz: 94,
          overall: 91,
          status: 'passed'
        },
        {
          id: 4,
          subject: 'Web Development Basics',
          subjectCode: 'IT104',
          midterm: 75,
          final: 78,
          assignment: 82,
          quiz: 76,
          overall: 77.75,
          status: 'passed'
        },
        {
          id: 5,
          subject: 'Database Management',
          subjectCode: 'IT105',
          midterm: 88,
          final: 85,
          assignment: 90,
          quiz: 87,
          overall: 87.5,
          status: 'passed'
        },
        {
          id: 6,
          subject: 'Networking Essentials',
          subjectCode: 'IT106',
          midterm: 82,
          final: 84,
          assignment: 80,
          quiz: 83,
          overall: 82.25,
          status: 'passed'
        },
        {
          id: 7,
          subject: 'Systems Analysis and Design',
          subjectCode: 'IT107',
          midterm: 79,
          final: 0,
          assignment: 85,
          quiz: 82,
          overall: 61.5,
          status: 'incomplete'
        }
      ];
      
      setGrades(mockGrades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#28a745';
    if (grade >= 80) return '#17a2b8';
    if (grade >= 75) return '#ffc107';
    if (grade >= 70) return '#fd7e14';
    return '#e74c3c';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#28a745';
      case 'failed':
        return '#e74c3c';
      case 'incomplete':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'passed':
        return '#d4edda';
      case 'failed':
        return '#f8d7da';
      case 'incomplete':
        return '#fff3cd';
      default:
        return '#f8f9fa';
    }
  };

  const calculateGPA = () => {
    const completedGrades = grades.filter(g => g.status === 'passed');
    if (completedGrades.length === 0) return 0;
    const total = completedGrades.reduce((sum, grade) => sum + grade.overall, 0);
    return (total / completedGrades.length).toFixed(2);
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
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading grades...</p>
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
            backgroundColor: '#ff6b35',
            borderLeft: (sidebarCollapsed && !sidebarHovered) ? 'none' : '4px solid #e55a2b',
            cursor: 'pointer',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            transition: 'all 0.3s ease',
            fontWeight: 'bold'
          }}>
            <>
              <FontAwesomeIcon icon={faPercent} />
              {!(sidebarCollapsed && !sidebarHovered) && " Grades"}
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
          onClick={() => navigate('/student-settings')}
          >
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
                <FontAwesomeIcon icon={faPercent} />
                My Grades
              </h1>
            </div>
          </div>

          {/* GPA Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              margin: '0 0 20px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              borderBottom: '2px solid #ff6b35',
              paddingBottom: '10px'
            }}>
              📊 Academic Performance
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  marginBottom: '10px'
                }}>
                  {calculateGPA()}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Current GPA
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginBottom: '10px'
                }}>
                  {grades.filter(g => g.status === 'passed').length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Courses Passed
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffc107',
                  marginBottom: '10px'
                }}>
                  {grades.filter(g => g.status === 'incomplete').length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Incomplete
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#17a2b8',
                  marginBottom: '10px'
                }}>
                  {grades.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Total Courses
                </div>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              margin: '0 0 20px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              borderBottom: '2px solid #ff6b35',
              paddingBottom: '10px'
            }}>
              📋 Detailed Grades
            </h2>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Subject</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Midterm</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Final</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Assignment</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Quiz</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Overall</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#2c3e50',
                      borderBottom: '1px solid #dee2e6'
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} style={{
                      borderBottom: '1px solid #dee2e6',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: '12px',
                        verticalAlign: 'top'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '4px'
                        }}>
                          {grade.subjectCode}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6c757d'
                        }}>
                          {grade.subject}
                        </div>
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: getGradeColor(grade.midterm),
                        fontWeight: 'bold'
                      }}>
                        {grade.midterm}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: getGradeColor(grade.final),
                        fontWeight: 'bold'
                      }}>
                        {grade.final || '-'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: getGradeColor(grade.assignment),
                        fontWeight: 'bold'
                      }}>
                        {grade.assignment}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: getGradeColor(grade.quiz),
                        fontWeight: 'bold'
                      }}>
                        {grade.quiz}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        color: getGradeColor(grade.overall),
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {grade.overall.toFixed(2)}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: getStatusBg(grade.status),
                          color: getStatusColor(grade.status),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase'
                        }}>
                          {grade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;
