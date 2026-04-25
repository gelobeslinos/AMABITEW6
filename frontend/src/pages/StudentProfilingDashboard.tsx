import React, { useEffect, useMemo, useState } from 'react';
import { studentProfileService, studentService } from '../services/api';
import { useToast } from '../components/ToastProvider';

interface StudentOption { id: number; full_name: string; student_id: string; }

interface StudentProfile {
  id: number;
  student_id: string;
  student: { id: number; full_name: string; student_id: string; email: string; program: string; year_level: number; };
  academic_profile: { academic_history: string; gpa: number; career_aspiration: string; };
  activities: { non_academic_activities: string; violations: string; skills: string[]; affiliations: string[]; };
}

interface Filters { search: string; }

interface FormState {
  student_id: string; academic_history: string; non_academic_activities: string;
  violations: string; skills: string; affiliations: string; gpa: string; career_aspiration: string;
}

const initialForm: FormState = {
  student_id: '', academic_history: '', non_academic_activities: '',
  violations: '', skills: '', affiliations: '', gpa: '', career_aspiration: '',
};

const ITEMS_PER_PAGE = 8;

const StudentProfilingDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  useEffect(() => { void loadStudents(); void loadProfiles(); }, []);

  const loadStudents = async () => {
    const data = await studentService.getAll();
    setStudents(data);
  };

  const loadProfiles = async (activeFilters: Filters = filters) => {
    try {
      setLoading(true);
      const data = await studentProfileService.getAll(activeFilters);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => { void loadProfiles({ search: value }); }, 300);
    setSearchTimeout(timeout);
  };

  const studentOptions = useMemo(
    () => students.map((s) => ({ value: String(s.id), label: s.full_name + ' (' + s.student_id + ')' })),
    [students],
  );

  const parseList = (value: string) =>
    value.split(',').map((item) => item.trim()).filter(Boolean);

  const openCreate = () => { setEditingProfile(null); setForm(initialForm); setShowForm(true); };

  const openEdit = (profile: StudentProfile) => {
    setEditingProfile(profile);
    setForm({
      student_id: String(profile.student.id),
      academic_history: profile.academic_profile.academic_history ?? '',
      non_academic_activities: profile.activities.non_academic_activities ?? '',
      violations: profile.activities.violations ?? '',
      skills: (profile.activities.skills || []).join(', '),
      affiliations: (profile.activities.affiliations || []).join(', '),
      gpa: profile.academic_profile.gpa ? String(profile.academic_profile.gpa) : '',
      career_aspiration: profile.academic_profile.career_aspiration ?? '',
    });
    setShowForm(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { toast.error('Please select a student'); return; }
    const payload = {
      student_id: Number(form.student_id),
      academic_history: form.academic_history,
      non_academic_activities: form.non_academic_activities,
      violations: form.violations,
      skills: parseList(form.skills),
      affiliations: parseList(form.affiliations),
      gpa: form.gpa ? Number(form.gpa) : null,
      career_aspiration: form.career_aspiration,
      needs_intervention: false,
    };
    console.log('Submitting payload:', payload);
    try {
      if (editingProfile) {
        await studentProfileService.update(editingProfile.id, payload);
        toast.success('Profile updated');
      } else {
        await studentProfileService.create(payload);
        toast.success('Profile created');
      }
      setShowForm(false);
      setForm(initialForm);
      await loadProfiles();
    } catch (error) {
      console.error('Save failed', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Error response:', axiosError.response?.data);
      }
      toast.error('Failed to save profile');
    }
  };

  const deleteProfile = async (profile: StudentProfile) => {
    if (!window.confirm('Delete profile for ' + profile.student.full_name + '?')) return;
    try {
      await studentProfileService.delete(profile.id);
      toast.success('Profile deleted');
      await loadProfiles();
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete profile');
    }
  };

  const exportToExcel = () => {
    const headers = ['Student Name','Student ID','Email','Program','Year Level','GPA','Academic History','Activities','Skills','Affiliations','Career Aspiration','Violations'];
    const rows = profiles.map(pr => [
      pr.student.full_name,
      pr.student.student_id,
      pr.student.email,
      pr.student.program,
      pr.student.year_level,
      pr.academic_profile.gpa ?? '',
      (pr.academic_profile.academic_history ?? '').replace(/,/g, ';'),
      (pr.activities.non_academic_activities ?? '').replace(/,/g, ';'),
      (pr.activities.skills || []).join(' | '),
      (pr.activities.affiliations || []).join(' | '),
      (pr.academic_profile.career_aspiration ?? '').replace(/,/g, ';'),
      (pr.activities.violations ?? '').replace(/,/g, ';'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'student_profiles.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(profiles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProfiles = profiles.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const needsAttentionCount = profiles.filter(pr => pr.activities.violations && pr.activities.violations.trim() !== '').length;
  const withGpaCount = profiles.filter(pr => pr.academic_profile.gpa).length;

  const focusOrange = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#ff6b35';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)';
  };
  const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ padding: 'clamp(20px,3vw,32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: '700', fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'Segoe UI, sans-serif' }}>Student Profiling</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>Manage comprehensive student data and profiles</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={exportToExcel}
            style={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: '#fff', padding: '11px 18px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(16,185,129,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.35)'; }}
          >📥 Export Excel</button>
          <button onClick={openCreate}
            style={{ background: 'linear-gradient(135deg,#ff6b35 0%,#e55a2b 100%)', color: '#fff', padding: '11px 18px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
          >+ Add Profile</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{profiles.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Total Profiles</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{withGpaCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>With GPA</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{needsAttentionCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Needs Attention</div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', pointerEvents: 'none' }} fill="none" stroke="#ff6b35" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search by name, student ID, skills, activities, or affiliations..."
            value={filters.search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '11px 16px 11px 44px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', color: '#1a1a1a' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#ff6b35'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8', fontFamily: 'Segoe UI, sans-serif' }}>
          💡 Tip: Search for skills like "JavaScript", activities like "basketball", or affiliations like "Student Council"
          {filters.search && profiles.length > 0 && (
            <span style={{ marginLeft: '12px', color: '#059669', fontWeight: '600' }}>({profiles.length} result{profiles.length !== 1 ? 's' : ''} found)</span>
          )}
        </div>
      </div>

      {/* Profile cards grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ border: '4px solid #ff6b35', borderTop: '4px solid transparent', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : paginatedProfiles.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif', marginBottom: '8px' }}>No profiles found</div>
          <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>Try adjusting your search or add a new profile</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '20px', marginBottom: '20px' }}>
          {paginatedProfiles.map(profile => (
            <div key={profile.id} style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Card header */}
              <div style={{ background: 'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff', fontFamily: 'Segoe UI, sans-serif' }}>{profile.student.full_name}</div>
                  <span style={{ background: 'rgba(255,107,53,0.2)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif', whiteSpace: 'nowrap' }}>{profile.student.student_id}</span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{profile.student.program}</span>
                  <span style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>Year {profile.student.year_level}</span>
                </div>
              </div>
              {/* Card body */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* GPA */}
                {profile.academic_profile.gpa && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🏆</span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>GPA:</span>
                    <span style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>{profile.academic_profile.gpa}</span>
                  </div>
                )}
                {/* Academic History */}
                {profile.academic_profile.academic_history && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>📚</span> Academic History</div>
                    <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{profile.academic_profile.academic_history}</div>
                  </div>
                )}
                {/* Career Aspiration */}
                {profile.academic_profile.career_aspiration && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>🎯</span>
                    <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{profile.academic_profile.career_aspiration}</div>
                  </div>
                )}
                {/* Activities */}
                {profile.activities.non_academic_activities && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>🎭</span> Activities</div>
                    <div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{profile.activities.non_academic_activities}</div>
                  </div>
                )}
                {/* Skills */}
                {(profile.activities.skills || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>🔧</span> Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(profile.activities.skills || []).slice(0, 5).map((skill, i) => (
                        <span key={i} style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{skill}</span>
                      ))}
                      {(profile.activities.skills || []).length > 5 && (
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontFamily: 'Segoe UI, sans-serif' }}>+{(profile.activities.skills || []).length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Affiliations */}
                {(profile.activities.affiliations || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>🏛️</span> Affiliations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(profile.activities.affiliations || []).slice(0, 4).map((aff, i) => (
                        <span key={i} style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{aff}</span>
                      ))}
                      {(profile.activities.affiliations || []).length > 4 && (
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontFamily: 'Segoe UI, sans-serif' }}>+{(profile.activities.affiliations || []).length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Violations */}
                {profile.activities.violations && profile.activities.violations.trim() !== '' && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Segoe UI, sans-serif', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span>⚠️</span> Violations</div>
                    <div style={{ fontSize: '13px', color: '#991b1b', fontFamily: 'Segoe UI, sans-serif' }}>{profile.activities.violations}</div>
                  </div>
                )}
              </div>
              {/* Card footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedProfile(profile)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#3b82f6'; }}
                >View</button>
                <button onClick={() => openEdit(profile)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#059669'; }}
                >Edit</button>
                <button onClick={() => void deleteProfile(profile)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#dc2626'; }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
            Showing {paginatedProfiles.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, profiles.length)} of {profiles.length} profiles
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage(pg => Math.max(1, pg - 1))} disabled={safePage === 1}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', opacity: safePage === 1 ? 0.4 : 1 }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: `1px solid ${page === safePage ? 'transparent' : '#e5e7eb'}`, background: page === safePage ? '#ff6b35' : '#fff', color: page === safePage ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(pg => Math.min(totalPages, pg + 1))} disabled={safePage === totalPages}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Segoe UI, sans-serif', opacity: safePage === totalPages ? 0.4 : 1 }}>Next →</button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1a1a1a', borderRadius: '16px 16px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>{editingProfile ? 'Edit Student Profile' : 'Add New Student Profile'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '0 4px', opacity: 0.7, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}>×</button>
            </div>
            <form onSubmit={submitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Student select */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Student</label>
                <select value={form.student_id} onChange={e => setForm(prev => ({ ...prev, student_id: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField}>
                  <option value="">Select student</option>
                  {studentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {/* Academic History */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Academic History</label>
                <textarea placeholder="Enter academic history..." value={form.academic_history} onChange={e => setForm(prev => ({ ...prev, academic_history: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
              </div>
              {/* Non-Academic Activities */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Non-Academic Activities</label>
                <textarea placeholder="Enter non-academic activities..." value={form.non_academic_activities} onChange={e => setForm(prev => ({ ...prev, non_academic_activities: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
              </div>
              {/* Violations */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Violations</label>
                <textarea placeholder="Enter any violations..." value={form.violations} onChange={e => setForm(prev => ({ ...prev, violations: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Skills */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Skills (comma-separated)</label>
                  <input placeholder="e.g. Programming, JavaScript" value={form.skills} onChange={e => setForm(prev => ({ ...prev, skills: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
                </div>
                {/* Affiliations */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Affiliations (comma-separated)</label>
                  <input placeholder="e.g. Student Council, Tech Club" value={form.affiliations} onChange={e => setForm(prev => ({ ...prev, affiliations: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
                </div>
                {/* GPA */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>GPA</label>
                  <input type="number" min="0" max="4" step="0.01" placeholder="0.0 – 4.0" value={form.gpa} onChange={e => setForm(prev => ({ ...prev, gpa: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
                </div>
                {/* Career Aspiration */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: 'Segoe UI, sans-serif' }}>Career Aspiration</label>
                  <input placeholder="Enter career aspiration..." value={form.career_aspiration} onChange={e => setForm(prev => ({ ...prev, career_aspiration: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} onFocus={focusOrange} onBlur={blurField} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#ff6b35 0%,#e55a2b 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >{editingProfile ? 'Update Profile' : 'Create Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1a1a1a', borderRadius: '16px 16px 0 0', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>Student Profile</h2>
              <button onClick={() => setSelectedProfile(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '0 4px', opacity: 0.7, transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}>×</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Student Info section */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', fontFamily: 'Segoe UI, sans-serif' }}>Student Information</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[['Name', selectedProfile.student.full_name],['Student ID', selectedProfile.student.student_id],['Email', selectedProfile.student.email],['Program', selectedProfile.student.program],['Year Level', 'Year ' + selectedProfile.student.year_level]].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', flexShrink: 0 }}>{label}:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif', textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Academic section */}
              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', fontFamily: 'Segoe UI, sans-serif' }}>Academic Information</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>GPA: </span><span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>{selectedProfile.academic_profile.gpa || 'N/A'}</span></div>
                  <div><div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px' }}>Academic History:</div><div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{selectedProfile.academic_profile.academic_history || 'N/A'}</div></div>
                  <div><div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px' }}>Career Aspiration:</div><div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{selectedProfile.academic_profile.career_aspiration || 'N/A'}</div></div>
                </div>
              </div>
              {/* Activities section */}
              <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', fontFamily: 'Segoe UI, sans-serif' }}>Activities &amp; Skills</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px' }}>Non-Academic Activities:</div><div style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>{selectedProfile.activities.non_academic_activities || 'N/A'}</div></div>
                  <div><div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '6px' }}>Skills:</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{(selectedProfile.activities.skills || []).length > 0 ? (selectedProfile.activities.skills || []).map((s, i) => <span key={i} style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{s}</span>) : <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>N/A</span>}</div></div>
                  <div><div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif', marginBottom: '6px' }}>Affiliations:</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{(selectedProfile.activities.affiliations || []).length > 0 ? (selectedProfile.activities.affiliations || []).map((a, i) => <span key={i} style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>{a}</span>) : <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>N/A</span>}</div></div>
                  {selectedProfile.activities.violations && selectedProfile.activities.violations.trim() !== '' && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}><div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif', marginBottom: '4px' }}>⚠️ Violations:</div><div style={{ fontSize: '13px', color: '#991b1b', fontFamily: 'Segoe UI, sans-serif' }}>{selectedProfile.activities.violations}</div></div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedProfile(null)} style={{ padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilingDashboard;
