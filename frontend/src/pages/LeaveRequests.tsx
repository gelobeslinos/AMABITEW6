import React, { useState, useEffect } from 'react';
import type { LeaveRequest, Employee } from '../types';
import { leaveRequestService, employeeService } from '../services/api';

const LeaveRequests: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'sick' as 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    manager_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaveRequestsData, employeesData] = await Promise.all([
        leaveRequestService.getAll(),
        employeeService.getAll(),
      ]);
      setLeaveRequests(leaveRequestsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employee_id) newErrors.employee_id = 'Employee is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const leaveRequestData = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        days: calculateDays(formData.start_date, formData.end_date),
      };

      if (editingLeaveRequest) {
        await leaveRequestService.update(editingLeaveRequest.id, leaveRequestData);
      } else {
        await leaveRequestService.create(leaveRequestData);
      }

      await fetchData();
      setShowModal(false);
      setEditingLeaveRequest(null);
      resetForm();
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error saving leave request:', error);
      }
    }
  };

  const handleEdit = (leaveRequest: LeaveRequest) => {
    setEditingLeaveRequest(leaveRequest);
    setFormData({
      employee_id: leaveRequest.employee_id.toString(),
      type: leaveRequest.type,
      start_date: leaveRequest.start_date,
      end_date: leaveRequest.end_date,
      reason: leaveRequest.reason,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveRequestService.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting leave request:', error);
      }
    }
  };

  const handleApproval = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setApprovalData({
      action: 'approve',
      manager_id: '',
      notes: '',
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveRequest || !approvalData.manager_id) return;

    try {
      if (approvalData.action === 'approve') {
        await leaveRequestService.approve(selectedLeaveRequest.id, parseInt(approvalData.manager_id), approvalData.notes);
      } else {
        await leaveRequestService.reject(selectedLeaveRequest.id, parseInt(approvalData.manager_id), approvalData.notes);
      }

      await fetchData();
      setShowApprovalModal(false);
      setSelectedLeaveRequest(null);
      setApprovalData({ action: 'approve', manager_id: '', notes: '' });
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      type: 'sick' as 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity',
      start_date: '',
      end_date: '',
      reason: '',
    });
    setErrors({});
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#dcfce7';
      case 'rejected': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending': return '#92400e';
      case 'approved': return '#166534';
      case 'rejected': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const filteredLeaveRequests = leaveRequests.filter(leaveRequest =>
    leaveRequest.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveRequest.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveRequest.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveRequest.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Leave Requests
        </h1>
        <button
          onClick={() => {
            resetForm();
            setEditingLeaveRequest(null);
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
          New Leave Request
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search leave requests..."
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
                  Type
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Period
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Days
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Reason
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
              {filteredLeaveRequests.map((leaveRequest) => (
                <tr key={leaveRequest.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {getEmployeeName(leaveRequest.employee_id)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827', textTransform: 'capitalize' }}>
                      {leaveRequest.type}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      {leaveRequest.start_date} to {leaveRequest.end_date}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      {leaveRequest.days} day{leaveRequest.days > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: getStatusColor(leaveRequest.status),
                      color: getStatusTextColor(leaveRequest.status)
                    }}>
                      {leaveRequest.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {leaveRequest.reason}
                    </div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '14px' }}>
                    <button
                      onClick={() => handleEdit(leaveRequest)}
                      style={{
                        color: '#3b82f6',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '8px',
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                    >
                      ✏️
                    </button>
                    {leaveRequest.status === 'pending' && (
                      <button
                        onClick={() => handleApproval(leaveRequest)}
                        style={{
                          color: '#10b981',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          marginRight: '8px',
                          padding: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#10b981'}
                      >
                        ✅
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(leaveRequest.id)}
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

      {/* Leave Request Modal */}
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
              {editingLeaveRequest ? 'Edit Leave Request' : 'New Leave Request'}
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
                    Leave Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="personal">Personal</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.start_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.start_date && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.start_date}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.end_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.end_date && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {errors.end_date}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.reason ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  {errors.reason && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.reason}
                    </div>
                  )}
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
                  {editingLeaveRequest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedLeaveRequest && (
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
              Leave Request Approval
            </h3>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
                {getEmployeeName(selectedLeaveRequest.employee_id)}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                Type: <span style={{ textTransform: 'capitalize' }}>{selectedLeaveRequest.type}</span>
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                Period: {selectedLeaveRequest.start_date} to {selectedLeaveRequest.end_date}
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                Days: {selectedLeaveRequest.days}
              </p>
            </div>
            <form onSubmit={handleApprovalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Action *
                  </label>
                  <select
                    required
                    value={approvalData.action}
                    onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as 'approve' | 'reject' })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Approving Manager *
                  </label>
                  <select
                    required
                    value={approvalData.manager_id}
                    onChange={(e) => setApprovalData({ ...approvalData, manager_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Manager</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
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
                  onClick={() => setShowApprovalModal(false)}
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
                    backgroundColor: approvalData.action === 'approve' ? '#10b981' : '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {approvalData.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
