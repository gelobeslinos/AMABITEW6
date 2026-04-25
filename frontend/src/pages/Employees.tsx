import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';
import { employeeService } from '../services/api';
import { useToast } from '../components/ToastProvider';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const AVATAR_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#6366f1'];

const getAvatarColor = (firstName: string): string => {
  if (!firstName) return AVATAR_COLORS[0];
  return AVATAR_COLORS[firstName.charCodeAt(0) % 8];
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    date_created: '',
    status: 'active' as 'active' | 'inactive' | 'terminated',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const employeesData = await employeeService.getAll();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+63\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be a valid PH number, e.g. +639171234567';
    }
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.date_created) newErrors.date_created = 'Date created is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('63')) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    const formatted = digits ? `+63${digits}` : '';
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const isEditing = !!editingEmployee;
    try {
      const employeeData = {
        ...formData,
        salary: 0,
        hire_date: formData.date_created,
      };
      console.log('Sending employee data:', employeeData);
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, employeeData);
      } else {
        await employeeService.create(employeeData);
      }
      await fetchData();
      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
      setErrors({});
      toast.success(isEditing ? 'Employee updated successfully.' : 'Employee added successfully.');
    } catch (error: any) {
      console.error('Error saving employee:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        console.error('Error message:', error.response.data.message);
      } else {
        console.error('Unknown error:', error);
      }
      toast.error('Failed to save employee. Please try again.');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      date_created: employee.created_at || '',
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        await fetchData();
        toast.success('Employee deleted successfully.');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      date_created: new Date().toISOString().slice(0, 10),
      status: 'active' as 'active' | 'inactive' | 'terminated',
    });
    setErrors({});
  };

  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee =>
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEmployees = filteredEmployees.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 14px',
    border: `2px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Segoe UI, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#1a1a1a',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    fontFamily: 'Segoe UI, sans-serif',
  };

  const statusConfig = {
    active:     { bg: '#dcfce7', color: '#16a34a' },
    inactive:   { bg: '#fef9c3', color: '#ca8a04' },
    terminated: { bg: '#fee2e2', color: '#dc2626' },
  };

  if (loading) {
    return (
      <div style={{ padding: 'clamp(20px, 3vw, 32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ border: '4px solid #ff6b35', borderTop: '4px solid transparent', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header card */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontWeight: '700', fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'Segoe UI, sans-serif' }}>Employees</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>Manage your organization's workforce</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingEmployee(null); setShowModal(true); }}
          style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)', color: '#fff', padding: '11px 20px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: '400' }}>+</span> Add Employee
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{employees.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Total Employees</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{activeCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Active</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{inactiveCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Inactive / Terminated</div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#ff6b35', pointerEvents: 'none', flexShrink: 0 }} fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search employees by name, email, or position..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '11px 16px 11px 44px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#1a1a1a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                {['Employee', 'Phone', 'Position', 'Date Created', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👥</div>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>No employees found</div>
                      <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>Try adjusting your search or add a new employee</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.map(employee => {
                const sc = statusConfig[employee.status] || statusConfig.inactive;
                return (
                  <tr
                    key={employee.id}
                    style={{ background: '#fff', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fff'; }}
                  >
                    {/* Name + avatar */}
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(employee.first_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '15px', flexShrink: 0 }}>
                          {employee.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>{employee.first_name} {employee.last_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginTop: '2px' }}>{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{employee.phone}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>
                        {employee.position}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{new Date(employee.created_at).toLocaleDateString()}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.color, display: 'inline-block', flexShrink: 0 }} />
                        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(employee)}
                          title="Edit Employee"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#3b82f6'; }}
                        >
                          <PencilIcon style={{ width: '15px', height: '15px' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          title="Delete Employee"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          <TrashIcon style={{ width: '15px', height: '15px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
          Showing {paginatedEmployees.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
        </span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', opacity: safePage === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: `1px solid ${page === safePage ? 'transparent' : '#e5e7eb'}`, background: page === safePage ? '#ff6b35' : '#fff', color: page === safePage ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', opacity: safePage === totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ background: '#1a1a1a', borderRadius: '16px 16px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '0 4px', opacity: 0.7, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} style={inputStyle(!!errors.first_name)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.first_name ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }} />
                  {errors.first_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.first_name}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} style={inputStyle(!!errors.last_name)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.last_name ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }} />
                  {errors.last_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.last_name}</div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle(!!errors.email)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }} />
                  {errors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.email}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" required value={formData.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="+639XXXXXXXXX" maxLength={13} style={inputStyle(!!errors.phone)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.phone ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }} />
                  {errors.phone && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.phone}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Position</label>
                  <select required value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} style={{ ...inputStyle(!!errors.position), backgroundColor: '#fff' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.position ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <option value="">Select Position</option>
                    <option value="Dean">Dean</option>
                    <option value="Dept Chair">Dept Chair</option>
                    <option value="Prof">Prof</option>
                    <option value="Secretary">Secretary</option>
                  </select>
                  {errors.position && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.position}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Date Created</label>
                  <input type="date" value={formData.date_created} readOnly disabled={!editingEmployee} style={{ ...inputStyle(!!errors.date_created), background: '#f9fafb', cursor: 'default' }} />
                  {errors.date_created && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontFamily: 'Segoe UI, sans-serif' }}>{errors.date_created}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'terminated' })} style={{ ...inputStyle(false), backgroundColor: '#fff' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 2px 8px rgba(255,107,53,0.35)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,107,53,0.35)'; }}>
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
