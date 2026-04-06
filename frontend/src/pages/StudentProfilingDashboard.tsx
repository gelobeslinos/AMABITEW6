import React, { useEffect, useMemo, useState } from 'react';
import { studentProfileService, studentService } from '../services/api';
import { useToast } from '../components/ToastProvider';

interface StudentOption {
  id: number;
  full_name: string;
  student_id: string;
}

interface StudentProfile {
  id: number;
  student_id: string;
  student: {
    id: number;
    full_name: string;
    student_id: string;
    email: string;
    program: string;
    year_level: number;
  };
  academic_profile: {
    academic_history: string;
    gpa: number;
    career_aspiration: string;
  };
  activities: {
    non_academic_activities: string;
    violations: string;
    skills: string[];
    affiliations: string[];
  };
}

interface Filters {
  skill: string;
  activity: string;
  affiliation: string;
  search: string;
}

interface FormState {
  student_id: string;
  academic_history: string;
  non_academic_activities: string;
  violations: string;
  skills: string;
  affiliations: string;
  gpa: string;
  career_aspiration: string;
}

const initialForm: FormState = {
  student_id: '',
  academic_history: '',
  non_academic_activities: '',
  violations: '',
  skills: '',
  affiliations: '',
  gpa: '',
  career_aspiration: '',
};

const StudentProfilingDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ skill: '', activity: '', affiliation: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const toast = useToast();

  useEffect(() => {
    void loadStudents();
    void loadProfiles();
  }, []);

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

  const studentOptions = useMemo(
    () => students.map((s) => ({ value: String(s.id), label: `${s.full_name} (${s.student_id})` })),
    [students],
  );

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const openCreate = () => {
    setEditingProfile(null);
    setForm(initialForm);
    setShowForm(true);
  };

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
    if (!form.student_id) {
      toast.error('Please select a student');
      return;
    }

    const payload = {
      student_id: Number(form.student_id),
      academic_history: form.academic_history,
      non_academic_activities: form.non_academic_activities,
      violations: form.violations,
      skills: parseList(form.skills),
      affiliations: parseList(form.affiliations),
      gpa: form.gpa ? Number(form.gpa) : null,
      career_aspiration: form.career_aspiration,
    };

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
      toast.error('Failed to save profile');
    }
  };

  const deleteProfile = async (profile: StudentProfile) => {
    if (!window.confirm(`Delete profile for ${profile.student.full_name}?`)) return;
    try {
      await studentProfileService.delete(profile.id);
      toast.success('Profile deleted');
      await loadProfiles();
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete profile');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Student Profile Module
        </h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Manage comprehensive student data, view profiles, and run filters for skills/activities. 
          <strong>Tip:</strong> Use comma-separated values in filters to search for multiple items (e.g., "Programming, JavaScript, Python").
        </p>
      </div>

      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500', marginBottom: '4px' }}>Quick Filter Examples:</div>
        <div style={{ fontSize: '12px', color: '#0c4a6e', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <div><strong>Skills:</strong> Programming, JavaScript, Python, React, Data Analysis</div>
          <div><strong>Activities:</strong> basketball, volunteer, mentor, research</div>
          <div><strong>Affiliations:</strong> Student Council, Tech Club, Computer Science Society</div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Skills (comma-separated)
          </label>
          <input 
            placeholder="e.g. Programming, JavaScript, Python" 
            value={filters.skill} 
            onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Activities (comma-separated)
          </label>
          <input 
            placeholder="e.g. basketball, volunteer, mentor" 
            value={filters.activity} 
            onChange={(e) => setFilters((prev) => ({ ...prev, activity: e.target.value }))}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Affiliations (comma-separated)
          </label>
          <input 
            placeholder="e.g. Student Council, Tech Club" 
            value={filters.affiliation} 
            onChange={(e) => setFilters((prev) => ({ ...prev, affiliation: e.target.value }))}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
            Search name / student ID
          </label>
          <input 
            placeholder="Search students..." 
            value={filters.search} 
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => loadProfiles()}
          style={{
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            const cleared = { skill: '', activity: '', affiliation: '', search: '' };
            setFilters(cleared);
            void loadProfiles(cleared);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button 
          onClick={openCreate}
          style={{
            padding: '12px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Add Student Profile
        </button>
      </div>

      {loading ? (
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
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Student
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Academic History
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Non-Academic Activities
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Skills
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Affiliations
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {profiles.map((profile) => (
                <tr key={profile.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {profile.student.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {profile.student.student_id}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={profile.academic_profile.academic_history || 'N/A'}>
                      {profile.academic_profile.academic_history || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={profile.activities.non_academic_activities || 'N/A'}>
                      {profile.activities.non_academic_activities || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={(profile.activities.skills || []).join(', ') || 'N/A'}>
                      {(profile.activities.skills || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: '#111827', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={(profile.activities.affiliations || []).join(', ') || 'N/A'}>
                      {(profile.activities.affiliations || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedProfile(profile)}
                        style={{
                          color: '#3b82f6',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="View Profile"
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openEdit(profile)}
                        style={{
                          color: '#3b82f6',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Profile"
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => void deleteProfile(profile)}
                        style={{
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Profile"
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {editingProfile ? 'Edit Profile' : 'Add Profile'}
              </h2>
            </div>
            <form onSubmit={submitForm} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Student
                  </label>
                  <select 
                    value={form.student_id} 
                    onChange={(e) => setForm((prev) => ({ ...prev, student_id: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select student</option>
                    {studentOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Academic History
                  </label>
                  <textarea 
                    placeholder="Academic history" 
                    value={form.academic_history} 
                    onChange={(e) => setForm((prev) => ({ ...prev, academic_history: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Non-Academic Activities
                  </label>
                  <textarea 
                    placeholder="Non-academic activities" 
                    value={form.non_academic_activities} 
                    onChange={(e) => setForm((prev) => ({ ...prev, non_academic_activities: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Violations
                  </label>
                  <textarea 
                    placeholder="Violations" 
                    value={form.violations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, violations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Skills (comma-separated)
                  </label>
                  <input 
                    placeholder="Skills (comma-separated)" 
                    value={form.skills} 
                    onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Affiliations (comma-separated)
                  </label>
                  <input 
                    placeholder="Affiliations (comma-separated)" 
                    value={form.affiliations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, affiliations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    GPA
                  </label>
                  <input 
                    placeholder="GPA" 
                    type="number" 
                    min="0" 
                    max="4" 
                    step="0.01" 
                    value={form.gpa} 
                    onChange={(e) => setForm((prev) => ({ ...prev, gpa: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Career Aspiration
                  </label>
                  <input 
                    placeholder="Career aspiration" 
                    value={form.career_aspiration} 
                    onChange={(e) => setForm((prev) => ({ ...prev, career_aspiration: e.target.value }))}
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Individual Student Profile
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Student Information</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Name:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Student ID:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.student_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Email:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Program:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.program}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Year Level:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.year_level}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Academic Information</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Academic History:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.academic_history || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>GPA:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.gpa || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Career Aspiration:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.career_aspiration || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Activities & Skills</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Non-Academic Activities:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.activities.non_academic_activities || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Skills:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {(selectedProfile.activities.skills || []).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Affiliations:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {(selectedProfile.activities.affiliations || []).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Violations:</span>
                    <p style={{ fontSize: '14px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.activities.violations || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilingDashboard;
