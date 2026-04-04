import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, studentService } from '../services/api';

interface LoginFormData {
  id: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    id: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Login attempt:', formData);
      
      // Check for master account first
      if (formData.id === 'MASTER001') {
        if (formData.password === 'password123') {
          console.log('Master credentials correct!');
          // Store master account info in localStorage
          const userData = {
            id: formData.id,
            employeeId: 0,
            name: 'Master Administrator',
            position: 'Master',
            role: 'master',
            isAuthenticated: true
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data stored:', userData);
          
          console.log('About to navigate to dashboard...');
          navigate('/dashboard');
          return;
        } else {
          // Wrong master password
          console.log('Master credentials wrong!');
          setErrors({ general: 'Wrong credentials' });
          setLoading(false);
          return;
        }
      }
      
      // Check for faculty login
      if (formData.id === 'rrgarcia@pnc.edu.ph') {
        if (formData.password === 'pncdangalngbayan2026') {
          console.log('Faculty credentials correct!');
          // Store faculty account info in localStorage
          const userData = {
            id: formData.id,
            email: formData.id,
            name: 'Ronald Garcia',
            role: 'faculty',
            department: 'College of Computer Studies',
            isAuthenticated: true
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Faculty user data stored:', userData);
          
          console.log('About to navigate to faculty dashboard...');
          navigate('/faculty-dashboard');
          return;
        } else {
          // Wrong faculty password
          console.log('Faculty credentials wrong!');
          setErrors({ general: 'Wrong credentials' });
          setLoading(false);
          return;
        }
      }
      
      // Check for student login (check against actual student_id from database)
      try {
        const students = await studentService.getAll();
        console.log('Fetched students:', students);
        
        const student = students.find((stu: any) => stu.student_id === formData.id);
        console.log('Student found:', student);
        
        if (student) {
          console.log('Attempting student login...');
          
          // Check if student is active
          if (student.status !== 'active') {
            setErrors({ general: 'Student account is not active. Please contact administrator.' });
            setLoading(false);
            return;
          }
          
          // Validate password (default password or changed password)
          // For now, we'll use the default password
          const defaultPassword = 'pncdangalngbayan2026';
          if (formData.password !== defaultPassword) {
            setErrors({ general: 'Invalid Student ID or password' });
            setLoading(false);
            return;
          }
          
          // Store student info in localStorage
          const userData = {
            id: formData.id,
            studentId: student.id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            role: 'student',
            isAuthenticated: true,
            needsPasswordChange: true // Flag to prompt password change
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Student user data stored:', userData);
          
          console.log('About to navigate to student dashboard...');
          navigate('/student-dashboard');
          return;
        }
      } catch (error) {
        console.error('Student login error:', error);
        // Continue to faculty/staff login if student check fails
      }
      
      // Fetch all employees to validate credentials
      const employees = await employeeService.getAll();
      console.log('Fetched employees:', employees);
      
      if (!employees || employees.length === 0) {
        setErrors({ general: 'No employee data available. Please try again.' });
        setLoading(false);
        return;
      }
      
      // Try multiple ID matching strategies
      let employee = null;
      
      // Strategy 1: Try exact match with first_name + last_name (no spaces)
      employee = employees.find(emp => {
        const nameId = emp.first_name.toLowerCase() + emp.last_name.toLowerCase();
        return nameId === formData.id.toLowerCase();
      });
      
      console.log('Strategy 1 result:', employee);
      
      // Strategy 2: Try with first_name.last_name (no spaces, dot)
      if (!employee) {
        employee = employees.find(emp => {
          const nameId = emp.first_name.toLowerCase() + '.' + emp.last_name.toLowerCase();
          return nameId === formData.id.toLowerCase();
        });
        console.log('Strategy 2 result:', employee);
      }
      
      // Strategy 3: Try with first_name + '_' + last_name
      if (!employee) {
        employee = employees.find(emp => {
          const nameId = emp.first_name.toLowerCase() + '_' + emp.last_name.toLowerCase();
          return nameId === formData.id.toLowerCase();
        });
        console.log('Strategy 3 result:', employee);
      }
      
      // Strategy 4: Try with email if it looks like an email
      if (!employee && formData.id.includes('@')) {
        employee = employees.find(emp => emp.email === formData.id);
        console.log('Strategy 4 (email) result:', employee);
      }
      
      console.log('Final employee found:', employee);
      
      if (!employee) {
        setErrors({ general: 'Wrong credentials' });
        setLoading(false);
        return;
      }
      
      // For now, use a simple password validation
      // In production, this should be proper password hashing
      const validPasswords = ['password', '123456', 'admin'];
      if (!validPasswords.includes(formData.password)) {
        setErrors({ general: 'Wrong credentials' });
        setLoading(false);
        return;
      }
      
      // Determine role based on position
      let role = 'faculty';
      if (employee.position === 'Dean') {
        role = 'dean';
      } else if (employee.position === 'Dept Chair') {
        role = 'deptchair';
      }
      
      // Store user info in localStorage
      const userData = {
        id: formData.id,
        employeeId: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        position: employee.position,
        role: role,
        isAuthenticated: true
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Employee user data stored:', userData);
      
      console.log('About to navigate to dashboard...');
      navigate('/dashboard');
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (errors.general) {
      setErrors({ ...errors, general: '' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <img 
            src="/1.jpg" 
            alt="CCS Logo" 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #ff6b35'
            }}
          />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 8px 0'
          }}>
            CCS Department
            <h6 style={{
              fontSize: '16px',
              fontWeight: 'normal',
              color: '#ff6b35',
              margin: '4px 0 0 0'
            }}>College of Computing Studies</h6>
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#ff6b35',
            margin: 0
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '32px 24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                User ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={handleInputChange('id')}
                placeholder="Enter your User ID"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.id ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.id) {
                    e.target.style.borderColor = '#ff6b35';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.id) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
                disabled={loading}
              />
              {errors.id && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.id}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#ff6b35';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
                disabled={loading}
              />
              {errors.password && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.password}
                </div>
              )}
            </div>

            {errors.general && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#991b1b',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ❌ {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#9ca3af' : '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 6px rgba(255, 107, 53, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#e55a2b';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(255, 107, 53, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#ff6b35';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(255, 107, 53, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Need help? Go to the office 
            </p>
            <div style={{
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: '1.4'
            }}>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
