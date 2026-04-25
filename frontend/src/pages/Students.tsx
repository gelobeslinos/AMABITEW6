import React, { useState, useEffect } from 'react';
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
  status: 'active' | 'inactive' | 'graduated';
  date_enrolled: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;
const AVATAR_COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#6366f1'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % 8];

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px',
  border: `2px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  borderRadius: '8px', fontSize: '14px',
  fontFamily: 'Segoe UI, sans-serif', outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  color: '#1a1a1a', background: '#fff',
});

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#374151', marginBottom: '6px',
  fontFamily: 'Segoe UI, sans-serif',
};

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    student_id: '', first_name: '', last_name: '', email: '',
    phone: '', year_level: '', program: '', date_enrolled: '',
    status: 'active' as 'active' | 'inactive' | 'graduated',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.student_id.trim()) newErrors.student_id = 'Student ID is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.year_level) newErrors.year_level = 'Year level is required';
    if (!formData.program.trim()) newErrors.program = 'Program is required';
    if (!formData.date_enrolled) newErrors.date_enrolled = 'Date enrolled is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const studentData = { ...formData, year_level: parseInt(formData.year_level) };
      if (editingStudent) {
        await studentService.update(editingStudent.id, studentData);
      } else {
        await studentService.create(studentData);
        const username = formData.student_id;
        const password = formData.password || 'pncdangalngbayan2026';
        console.log('Creating account for ' + formData.first_name + ' ' + formData.last_name);
        console.log('Username: ' + username + ', Password: ' + password + ', Email: ' + formData.email);
        toast.success(
          'Student account created!\n\nStudent: ' + formData.first_name + ' ' + formData.last_name +
          '\nUsername: ' + username + '\nPassword: ' + password +
          '\nEmail: ' + formData.email +
          '\n\nNote: Students can change their password after first login.'
        );
      }
      await fetchData();
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      setErrors({});
    } catch (error: any) {
      console.error('Error saving student:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, 'Error');
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      year_level: student.year_level.toString(),
      program: student.program,
      date_enrolled: student.date_enrolled,
      status: student.status,
      password: '',
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, newStatus: 'active' | 'inactive' | 'graduated') => {
    try {
      await studentService.update(id, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '', first_name: '', last_name: '', email: '',
      phone: '', year_level: '', program: '', date_enrolled: '',
      status: 'active', password: '',
    });
    setErrors({});
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s =>
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.program.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const graduatedCount = students.filter(s => s.status === 'graduated').length;

  const focusOrange = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#ff6b35';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)';
  };
  const blurField = (hasErr: boolean) => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = hasErr ? '#ef4444' : '#e5e7eb';
    e.currentTarget.style.boxShadow = 'none';
  };

  if (loading) {
    return (
      <div style={{ padding: 'clamp(20px,3vw,32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ border: '4px solid #ff6b35', borderTop: '4px solid transparent', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px,3vw,32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: '700', fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'Segoe UI, sans-serif' }}>Students</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>Manage CSS department students</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingStudent(null); setShowModal(true); }}
          style={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: '#fff', padding: '11px 20px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.35)'; }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: '400' }}>+</span> Add Student &amp; Create Account
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totalCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Total Students</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{activeCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Active</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{graduatedCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Graduated</div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', pointerEvents: 'none' }} fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search students by name, email, ID, or program..."
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
                {['Student','Student ID','Program','Year','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎓</div>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>No students found</div>
                      <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>Try adjusting your search or add a new student</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.map(student => {
                const statusConfig: Record<string, {bg:string;color:string;label:string}> = {
                  active:    { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
                  inactive:  { bg: '#fef9c3', color: '#ca8a04', label: 'Inactive' },
                  graduated: { bg: '#ede9fe', color: '#7c3aed', label: 'Graduated' },
                };
                const sc = statusConfig[student.status] || statusConfig.inactive;
                return (
                  <tr key={student.id}
                    style={{ background: '#fff', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fff'; }}
                  >
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(student.first_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '15px', flexShrink: 0 }}>
                          {student.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>{student.first_name} {student.last_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginTop: '2px' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>{student.student_id}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{student.program}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>Year {student.year_level}</span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.color, display: 'inline-block', flexShrink: 0 }} />
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={student.status}
                          onChange={e => handleStatusChange(student.id, e.target.value as 'active' | 'inactive' | 'graduated')}
                          title="Change Student Status"
                          style={{ padding: '5px 8px', borderRadius: '7px', border: '1px solid #e5e7eb', fontSize: '12px', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', background: '#fff', color: '#374151', outline: 'none' }}
                        >
                          <option value="active">🟢 Enrolled</option>
                          <option value="inactive">🟡 Not Enrolled</option>
                          <option value="graduated">🔵 Graduated</option>
                        </select>
                        <button
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#3b82f6'; }}
                        >
                          <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
          Showing {paginatedStudents.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
        </span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', opacity: safePage === 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: `1px solid ${page === safePage ? 'transparent' : '#e5e7eb'}`, background: page === safePage ? '#ff6b35' : '#fff', color: page === safePage ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s', opacity: safePage === totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1a1a1a', borderRadius: '16px 16px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '0 4px', opacity: 0.7, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Student ID */}
                <div>
                  <label style={labelStyle}>Student ID</label>
                  <input type="text" required value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} style={inputStyle(!!errors.student_id)} onFocus={focusOrange} onBlur={blurField(!!errors.student_id)} />
                  {errors.student_id && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.student_id}</div>}
                </div>
                {/* First Name */}
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} style={inputStyle(!!errors.first_name)} onFocus={focusOrange} onBlur={blurField(!!errors.first_name)} />
                  {errors.first_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.first_name}</div>}
                </div>
                {/* Last Name */}
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} style={inputStyle(!!errors.last_name)} onFocus={focusOrange} onBlur={blurField(!!errors.last_name)} />
                  {errors.last_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.last_name}</div>}
                </div>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle(!!errors.email)} onFocus={focusOrange} onBlur={blurField(!!errors.email)} />
                  {errors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                </div>
                {/* Password */}
                <div>
                  <label style={labelStyle}>Password {!editingStudent && <span style={{ color: '#ef4444' }}>*</span>}</label>
                  <input type="password" required={!editingStudent} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editingStudent ? 'Leave blank to keep current' : 'Enter password'} style={inputStyle(!!errors.password)} onFocus={focusOrange} onBlur={blurField(!!errors.password)} />
                  {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
                  {!editingStudent && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Default: pncdangalngbayan2026</div>}
                </div>
                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle(!!errors.phone)} onFocus={focusOrange} onBlur={blurField(!!errors.phone)} />
                  {errors.phone && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</div>}
                </div>
                {/* Year Level */}
                <div>
                  <label style={labelStyle}>Year Level</label>
                  <select required value={formData.year_level} onChange={e => setFormData({ ...formData, year_level: e.target.value })} style={{ ...inputStyle(!!errors.year_level), backgroundColor: '#fff' }} onFocus={focusOrange} onBlur={blurField(!!errors.year_level)}>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {errors.year_level && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.year_level}</div>}
                </div>
                {/* Program */}
                <div>
                  <label style={labelStyle}>Program</label>
                  <select required value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })} style={{ ...inputStyle(!!errors.program), backgroundColor: '#fff' }} onFocus={focusOrange} onBlur={blurField(!!errors.program)}>
                    <option value="">Select Program</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                  {errors.program && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.program}</div>}
                </div>
                {/* Date Enrolled */}
                <div>
                  <label style={labelStyle}>Date Enrolled</label>
                  <input type="date" required value={formData.date_enrolled} onChange={e => setFormData({ ...formData, date_enrolled: e.target.value })} style={inputStyle(!!errors.date_enrolled)} onFocus={focusOrange} onBlur={blurField(!!errors.date_enrolled)} />
                  {errors.date_enrolled && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.date_enrolled}</div>}
                </div>
                {/* Status */}
                <div>
                  <label style={labelStyle}>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'graduated' })} style={{ ...inputStyle(false), backgroundColor: '#fff' }} onFocus={focusOrange} onBlur={blurField(false)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >Cancel</button>
                <button type="submit"
                  style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#ff6b35 0%,#e55a2b 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
                >{editingStudent ? 'Update Student' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
