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

  const getUserInfo = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  };

  const handleApproval = (leaveRequest: LeaveRequest) => {
    const userInfo = getUserInfo();
    // Pre-fill manager_id from the logged-in user's employeeId
    const defaultManagerId = userInfo?.employeeId ? String(userInfo.employeeId) : '';
    setSelectedLeaveRequest(leaveRequest);
    setApprovalData({
      action: 'approve',
      manager_id: defaultManagerId,
      notes: '',
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveRequest) return;

    // If still no manager_id, use the first available employee as fallback
    const managerId = approvalData.manager_id || (employees.length > 0 ? String(employees[0].id) : '');
    if (!managerId) {
      alert('No manager available. Please ensure employees exist in the system.');
      return;
    }

    try {
      if (approvalData.action === 'approve') {
        await leaveRequestService.approve(selectedLeaveRequest.id, parseInt(managerId), approvalData.notes);
      } else {
        await leaveRequestService.reject(selectedLeaveRequest.id, parseInt(managerId), approvalData.notes);
      }

      await fetchData();
      setShowApprovalModal(false);
      setSelectedLeaveRequest(null);
      setApprovalData({ action: 'approve', manager_id: '', notes: '' });
    } catch (error: any) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif', gap: '20px' }}>
        <style>{`@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.92)}}`}</style>
        <img src="/1.jpg" alt="CCS" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f59e0b', boxShadow: '0 0 0 8px rgba(245,158,11,.15)', animation: 'blink 1.2s ease-in-out infinite' }} />
        <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '500', letterSpacing: '.3px', fontFamily: 'Segoe UI, sans-serif' }}>Loading Leave Requests...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header card */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontWeight: '700', fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'Segoe UI, sans-serif' }}>Leave Requests</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingLeaveRequest(null);
            setShowModal(true);
          }}
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', padding: '11px 20px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(245,158,11,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)'; }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: '400' }}>+</span> New Leave Request
        </button>
      </div>

      {/* Search and Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Search Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>Search Requests</h2>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search leave requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Segoe UI, sans-serif',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none'
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>Request Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                {filteredLeaveRequests.filter(lr => lr.status === 'pending').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                {filteredLeaveRequests.filter(lr => lr.status === 'approved').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Approved</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                {filteredLeaveRequests.filter(lr => lr.status === 'rejected').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Rejected</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                {filteredLeaveRequests.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Employee
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Type
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Period
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Days
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Status
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Reason
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Segoe UI, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaveRequests.map((leaveRequest) => (
                <tr key={leaveRequest.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                      {getEmployeeName(leaveRequest.employee_id)}
                    </div>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize', fontFamily: 'Segoe UI, sans-serif' }}>
                      {leaveRequest.type}
                    </div>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>
                      {leaveRequest.start_date} to {leaveRequest.end_date}
                    </div>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>
                      {calculateDays(leaveRequest.start_date, leaveRequest.end_date)} day{calculateDays(leaveRequest.start_date, leaveRequest.end_date) > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(leaveRequest.status),
                      color: getStatusTextColor(leaveRequest.status),
                      textTransform: 'capitalize',
                      fontFamily: 'Segoe UI, sans-serif'
                    }}>
                      {leaveRequest.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#374151', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Segoe UI, sans-serif' }}>
                      {leaveRequest.reason}
                    </div>
                  </td>
                  <td style={{ padding: '20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(leaveRequest)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(245,158,11,0.08)',
                          color: '#f59e0b',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.color = '#f59e0b'; }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleApproval(leaveRequest)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(16,185,129,0.08)',
                          color: '#10b981',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#10b981'; }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleDelete(leaveRequest.id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(239,68,68,0.08)',
                          color: '#ef4444',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        🗑️
                      </button>
                    </div>
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              margin: '-32px -32px 24px -32px',
              padding: '24px 32px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>
                {editingLeaveRequest ? 'Edit Leave Request' : 'New Leave Request'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLeaveRequest(null);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Employee *
                  </label>
                  <select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.employee_id ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.employee_id && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontFamily: 'Segoe UI, sans-serif' }}>
                      {errors.employee_id}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Leave Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
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
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: errors.start_date ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: 'Segoe UI, sans-serif',
                        outline: 'none',
                        transition: 'border-color 0.15s'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    />
                    {errors.start_date && (
                      <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontFamily: 'Segoe UI, sans-serif' }}>
                        {errors.start_date}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: errors.end_date ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: 'Segoe UI, sans-serif',
                        outline: 'none',
                        transition: 'border-color 0.15s'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    />
                    {errors.end_date && (
                      <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontFamily: 'Segoe UI, sans-serif' }}>
                        {errors.end_date}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Reason *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    placeholder="Enter reason for leave request..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: errors.reason ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  />
                  {errors.reason && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontFamily: 'Segoe UI, sans-serif' }}>
                      {errors.reason}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLeaveRequest(null);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI, sans-serif',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI, sans-serif',
                    boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.45)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.35)'; }}
                >
                  {editingLeaveRequest ? 'Update' : 'Submit Request'}
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              margin: '-32px -32px 24px -32px',
              padding: '24px 32px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>
                Review Leave Request
              </h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedLeaveRequest(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApprovalSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', fontFamily: 'Segoe UI, sans-serif' }}>Employee</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    {getEmployeeName(selectedLeaveRequest.employee_id)}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', fontFamily: 'Segoe UI, sans-serif' }}>Type</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize', fontFamily: 'Segoe UI, sans-serif' }}>
                      {selectedLeaveRequest.type}
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', fontFamily: 'Segoe UI, sans-serif' }}>Days</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                      {calculateDays(selectedLeaveRequest.start_date, selectedLeaveRequest.end_date)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Approving Manager *
                  </label>
                  <select
                    value={approvalData.manager_id}
                    onChange={(e) => setApprovalData({ ...approvalData, manager_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      background: '#fff',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <option value="">Select Manager</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Action *
                  </label>
                  <select
                    value={approvalData.action}
                    onChange={(e) => setApprovalData({ ...approvalData, action: e.target.value as 'approve' | 'reject' })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
                    Manager Notes
                  </label>
                  <textarea
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
                    rows={3}
                    placeholder="Optional notes for this decision..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontFamily: 'Segoe UI, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedLeaveRequest(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI, sans-serif',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: approvalData.action === 'approve' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Segoe UI, sans-serif',
                    boxShadow: approvalData.action === 'approve' 
                      ? '0 4px 14px rgba(16,185,129,0.35)' 
                      : '0 4px 14px rgba(239,68,68,0.35)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
