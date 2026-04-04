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
      <h1 style={{ marginTop: 0 }}>Student Profile Module</h1>
      <p>Manage comprehensive student data, view profiles, and run filters for skills/activities.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <input placeholder="Filter by skill (e.g. Basketball)" value={filters.skill} onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))} />
        <input placeholder="Filter by activity" value={filters.activity} onChange={(e) => setFilters((prev) => ({ ...prev, activity: e.target.value }))} />
        <input placeholder="Filter by affiliation" value={filters.affiliation} onChange={(e) => setFilters((prev) => ({ ...prev, affiliation: e.target.value }))} />
        <input placeholder="Search name / student ID" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={() => loadProfiles()}>Apply Filters</button>
        <button
          onClick={() => {
            const cleared = { skill: '', activity: '', affiliation: '', search: '' };
            setFilters(cleared);
            void loadProfiles(cleared);
          }}
        >
          Clear
        </button>
        <button onClick={openCreate}>Add Student Profile</button>
      </div>

      {loading ? (
        <p>Loading profiles...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Student</th>
              <th style={{ textAlign: 'left' }}>Academic History</th>
              <th style={{ textAlign: 'left' }}>Non-Academic Activities</th>
              <th style={{ textAlign: 'left' }}>Skills</th>
              <th style={{ textAlign: 'left' }}>Affiliations</th>
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td>{profile.student.full_name} ({profile.student.student_id})</td>
                <td>{profile.academic_profile.academic_history || 'N/A'}</td>
                <td>{profile.activities.non_academic_activities || 'N/A'}</td>
                <td>{(profile.activities.skills || []).join(', ') || 'N/A'}</td>
                <td>{(profile.activities.affiliations || []).join(', ') || 'N/A'}</td>
                <td>
                  <button onClick={() => setSelectedProfile(profile)}>View</button>{' '}
                  <button onClick={() => openEdit(profile)}>Edit</button>{' '}
                  <button onClick={() => void deleteProfile(profile)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ marginTop: 20, padding: 16, backgroundColor: '#fff', border: '1px solid #ddd' }}>
          <h3>{editingProfile ? 'Edit Profile' : 'Add Profile'}</h3>
          <form onSubmit={submitForm} style={{ display: 'grid', gap: 10 }}>
            <select value={form.student_id} onChange={(e) => setForm((prev) => ({ ...prev, student_id: e.target.value }))}>
              <option value="">Select student</option>
              {studentOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
            <textarea placeholder="Academic history" value={form.academic_history} onChange={(e) => setForm((prev) => ({ ...prev, academic_history: e.target.value }))} />
            <textarea placeholder="Non-academic activities" value={form.non_academic_activities} onChange={(e) => setForm((prev) => ({ ...prev, non_academic_activities: e.target.value }))} />
            <textarea placeholder="Violations" value={form.violations} onChange={(e) => setForm((prev) => ({ ...prev, violations: e.target.value }))} />
            <input placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} />
            <input placeholder="Affiliations (comma-separated)" value={form.affiliations} onChange={(e) => setForm((prev) => ({ ...prev, affiliations: e.target.value }))} />
            <input placeholder="GPA" type="number" min="0" max="4" step="0.01" value={form.gpa} onChange={(e) => setForm((prev) => ({ ...prev, gpa: e.target.value }))} />
            <input placeholder="Career aspiration" value={form.career_aspiration} onChange={(e) => setForm((prev) => ({ ...prev, career_aspiration: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedProfile && (
        <div style={{ marginTop: 20, padding: 16, backgroundColor: '#fff', border: '1px solid #ddd' }}>
          <h3>Individual Student Profile</h3>
          <p><strong>Student:</strong> {selectedProfile.student.full_name} ({selectedProfile.student.student_id})</p>
          <p><strong>Email:</strong> {selectedProfile.student.email}</p>
          <p><strong>Academic History:</strong> {selectedProfile.academic_profile.academic_history || 'N/A'}</p>
          <p><strong>Non-Academic Activities:</strong> {selectedProfile.activities.non_academic_activities || 'N/A'}</p>
          <p><strong>Violations:</strong> {selectedProfile.activities.violations || 'N/A'}</p>
          <p><strong>Skills:</strong> {(selectedProfile.activities.skills || []).join(', ') || 'N/A'}</p>
          <p><strong>Affiliations:</strong> {(selectedProfile.activities.affiliations || []).join(', ') || 'N/A'}</p>
          <button onClick={() => setSelectedProfile(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default StudentProfilingDashboard;
