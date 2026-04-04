import React, { useState, useEffect } from 'react';
import type { Attendance, Employee } from '../types';
import { attendanceService, employeeService } from '../services/api';

const Attendance: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    check_in: '',
    check_out: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half_day',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching attendance data...');
      const [attendancesData, employeesData] = await Promise.all([
        attendanceService.getAll(),
        employeeService.getAll(),
      ]);
      console.log('Attendance data:', attendancesData);
      console.log('Employees data:', employeesData);
      setAttendances(Array.isArray(attendancesData) ? attendancesData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendances([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.check_in && formData.check_out && formData.check_in >= formData.check_out) {
      newErrors.check_out = 'Check out must be after check in';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const attendanceData = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
      };

      if (editingAttendance) {
        await attendanceService.update(editingAttendance.id, attendanceData);
      } else {
        await attendanceService.create(attendanceData);
      }

      await fetchData();
      setShowModal(false);
      setEditingAttendance(null);
      resetForm();
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error saving attendance:', error);
      }
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      employee_id: attendance.employee_id.toString(),
      date: attendance.date,
      check_in: attendance.check_in || '',
      check_out: attendance.check_out || '',
      status: attendance.status,
      notes: attendance.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceService.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: '',
      check_in: '',
      check_out: '',
      status: 'present' as 'present' | 'absent' | 'late' | 'half_day',
      notes: '',
    });
    setErrors({});
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#dcfce7';
      case 'absent': return '#fee2e2';
      case 'late': return '#fef3c7';
      case 'half_day': return '#e0e7ff';
      default: return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'present': return '#166534';
      case 'absent': return '#991b1b';
      case 'late': return '#92400e';
      case 'half_day': return '#1e40af';
      default: return '#6b7280';
    }
  };

  const filteredAttendances = Array.isArray(attendances) ? attendances.filter(attendance =>
    attendance.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.date.includes(searchTerm)
  ) : [];

  if (loading) {
    console.log('Attendance component is loading...');
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' }}>
        <div style={{ 
          border: '4px solid #3b82f6',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  console.log('Attendance component rendering, loading:', loading, 'attendances length:', attendances.length);

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Attendance Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setEditingAttendance(null);
            setShowModal(true);
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          Mark Attendance
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search attendance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: '40px',
                paddingRight: '16px',
                padding: '8px 16px',
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }}>
              🔍
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Employee
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Check In
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Check Out
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Hours
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Notes
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
              {filteredAttendances.map((attendance) => (
                <tr key={attendance.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {getEmployeeName(attendance.employee_id)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{attendance.date}</div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{attendance.check_in || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{attendance.check_out || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: getStatusColor(attendance.status),
                      color: getStatusTextColor(attendance.status)
                    }}>
                      {attendance.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      {attendance.work_hours ? `${attendance.work_hours.toFixed(2)}h` : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attendance.notes || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px' }}>
                    <button
                      onClick={() => handleEdit(attendance)}
                      style={{
                        color: '#3b82f6',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '12px',
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(attendance.id)}
                      style={{
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 50
        }}>
          <div style={{
            position: 'relative',
            marginTop: '80px',
            marginRight: 'auto',
            marginLeft: 'auto',
            padding: '20px',
            border: '1px solid #d1d5db',
            width: '500px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              {editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Employee *
                  </label>
                  <select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.employee_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.employee_id && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.employee_id}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.date ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.date && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.date}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Check In
                    </label>
                    <input
                      type="time"
                      value={formData.check_in}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.check_out ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.check_out && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.check_out}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Check Out
                    </label>
                    <input
                      type="time"
                      value={formData.check_out}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'present' | 'absent' | 'late' | 'half_day' })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    color: 'white',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {editingAttendance ? 'Update' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
