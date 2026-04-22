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
  const [filters, setFilters] = useState<Filters>({ search: '' });
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

  // Real-time search with debounce
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      void loadProfiles({ search: value });
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
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
      needs_intervention: false, // Required boolean field
    };

    console.log('Submitting payload:', payload);
    console.log('Form data:', form);

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
      // Log detailed error response for debugging
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Validation errors:', axiosError.response?.data?.errors);
      }
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
    <div style={{
      padding: 'clamp(12px, 3vw, 24px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 16px)',
          marginBottom: 'clamp(12px, 2vw, 16px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 'clamp(10px, 2vw, 12px)',
            height: 'clamp(10px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            borderRadius: '50%'
          }}></div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            Student Profile Module
          </h1>
        </div>
        <p style={{ color: '#64748b', marginTop: 'clamp(6px, 1.5vw, 8px)', fontSize: 'clamp(14px, 2.5vw, 16px)', lineHeight: '1.5' }}>
          Manage comprehensive student data, view profiles, and run filters for skills/activities. 
          <strong>Tip:</strong> Use comma-separated values in filters to search for multiple items (e.g., "Programming, JavaScript, Python").
        </p>
      </div>

      <div style={{ 
        marginBottom: 'clamp(16px, 3vw, 24px)', 
        padding: 'clamp(16px, 3vw, 20px)', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
        border: '1px solid #bae6fd', 
        borderRadius: 'clamp(10px, 2vw, 12px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '0 12px 0 80px'
        }}></div>
        <div style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: '#0369a1', fontWeight: '600', marginBottom: 'clamp(6px, 1.5vw, 8px)', display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
          <div style={{
            width: 'clamp(6px, 1.5vw, 8px)',
            height: 'clamp(6px, 1.5vw, 8px)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '50%'
          }}></div>
          Quick Filter Examples
        </div>
        <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#0c4a6e', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.5vw, 8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Try searching:</span>
            <span>"Programming", "JavaScript", "Python", "React", "Data Analysis"</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Activities:</span>
            <span>"basketball", "volunteer", "mentor", "research"</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Affiliations:</span>
            <span>"Student Council", "Tech Club", "Computer Science Society"</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Student Info:</span>
            <span>Student names and IDs</span>
          </div>
        </div>
      </div>

      <div style={{ 
        marginBottom: 'clamp(20px, 4vw, 32px)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 'clamp(12px, 2.5vw, 16px)',
        padding: 'clamp(20px, 4vw, 28px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
          borderRadius: '0 16px 0 100px'
        }}></div>
        
        <h3 style={{ 
          fontSize: 'clamp(16px, 3vw, 18px)', 
          fontWeight: '600', 
          color: '#1e293b', 
          marginBottom: 'clamp(16px, 3vw, 20px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 10px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 'clamp(6px, 1.5vw, 8px)',
            height: 'clamp(6px, 1.5vw, 8px)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '50%'
          }}></div>
          Filter Student Profiles
        </h3>
        
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <label style={{ display: 'block', fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: '600', color: '#374151', marginBottom: 'clamp(10px, 2vw, 12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
              <div style={{
                width: 'clamp(6px, 1.5vw, 8px)',
                height: 'clamp(6px, 1.5vw, 8px)',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '50%'
              }}></div>
              Search Student Profiles
            </div>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 'clamp(12px, 3vw, 16px)',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#6366f1',
              pointerEvents: 'none'
            }}>
              🔍
            </div>
            <input 
              placeholder="Search by name, student ID, skills, activities, or affiliations..." 
              value={filters.search} 
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: 'clamp(12px, 3vw, 16px) clamp(12px, 3vw, 16px) clamp(12px, 3vw, 16px) clamp(40px, 8vw, 50px)',
                border: '2px solid #e5e7eb',
                borderRadius: 'clamp(10px, 2vw, 12px)',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 15px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            />
          </div>
          {filters.search && (
            <div style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              fontSize: '13px',
              color: '#0369a1',
              textAlign: 'center'
            }}>
              <span>Searching for: </span>
              <strong>"{filters.search}"</strong>
              {profiles.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#059669' }}>
                  ({profiles.length} result{profiles.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </div>
          )}
          <div style={{
            marginTop: '12px',
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            💡 Tip: Search for anything - skills like "JavaScript", activities like "basketball", or affiliations like "Student Council"
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 'clamp(12px, 2vw, 16px)', 
        marginBottom: 'clamp(20px, 4vw, 32px)', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => loadProfiles()}
          style={{
            padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
          }}
        >
          <span>🔍</span> Apply Filters
        </button>
        <button
          onClick={() => {
            const cleared = { search: '' };
            setFilters(cleared);
            void loadProfiles(cleared);
          }}
          style={{
            padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#475569',
            border: '2px solid #e2e8f0',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <span>🔄</span> Clear
        </button>
        <button 
          onClick={openCreate}
          style={{
            padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
        >
          <span>➕</span> Add Student Profile
        </button>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '256px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            border: '4px solid #6366f1',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <div style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
            borderRadius: '0 16px 0 150px'
          }}></div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
            <thead style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
              borderBottom: '2px solid #e2e8f0'
            }}>
              <tr>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Student
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Academic History
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Activities
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Skills
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Affiliations
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {profiles.map((profile, index) => (
                <tr 
                  key={profile.id} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease',
                    background: index % 2 === 0 ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {profile.student.full_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '50%'
                      }}></div>
                      {profile.student.student_id}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      maxWidth: '250px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }} title={profile.academic_profile.academic_history || 'N/A'}>
                      {profile.academic_profile.academic_history || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      maxWidth: '250px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }} title={profile.activities.non_academic_activities || 'N/A'}>
                      {profile.activities.non_academic_activities || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      maxWidth: '200px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }} title={(profile.activities.skills || []).join(', ') || 'N/A'}>
                      {(profile.activities.skills || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      maxWidth: '200px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }} title={(profile.activities.affiliations || []).join(', ') || 'N/A'}>
                      {(profile.activities.affiliations || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => setSelectedProfile(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                        title="View Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => openEdit(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        title="Edit Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => void deleteProfile(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}
                        title="Delete Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        <span>Delete</span>
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              borderRadius: '0 16px 0 120px'
            }}></div>
            
            <div style={{ 
              padding: '32px', 
              borderBottom: '1px solid #e2e8f0',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '50%'
                }}></div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  {editingProfile ? 'Edit Student Profile' : 'Add New Student Profile'}
                </h2>
              </div>
            </div>
            <form onSubmit={submitForm} style={{ padding: '32px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Student
                    </div>
                  </label>
                  <select 
                    value={form.student_id} 
                    onChange={(e) => setForm((prev) => ({ ...prev, student_id: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select student</option>
                    {studentOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Academic History
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter academic history..." 
                    value={form.academic_history} 
                    onChange={(e) => setForm((prev) => ({ ...prev, academic_history: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Non-Academic Activities
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter non-academic activities..." 
                    value={form.non_academic_activities} 
                    onChange={(e) => setForm((prev) => ({ ...prev, non_academic_activities: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#f59e0b';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Violations
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter any violations..." 
                    value={form.violations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, violations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Skills (comma-separated)
                    </div>
                  </label>
                  <input 
                    placeholder="e.g. Programming, JavaScript, Python" 
                    value={form.skills} 
                    onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Affiliations (comma-separated)
                    </div>
                  </label>
                  <input 
                    placeholder="e.g. Student Council, Tech Club" 
                    value={form.affiliations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, affiliations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%'
                      }}></div>
                      GPA
                    </div>
                  </label>
                  <input 
                    placeholder="Enter GPA (0.0 - 4.0)" 
                    type="number" 
                    min="0" 
                    max="4" 
                    step="0.01" 
                    value={form.gpa} 
                    onChange={(e) => setForm((prev) => ({ ...prev, gpa: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#f59e0b';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Career Aspiration
                    </div>
                  </label>
                  <input 
                    placeholder="Enter career aspiration..." 
                    value={form.career_aspiration} 
                    onChange={(e) => setForm((prev) => ({ ...prev, career_aspiration: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    color: '#475569',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <span>❌</span> Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                  }}
                >
                  <span>💾</span> {editingProfile ? 'Update Profile' : 'Create Profile'}
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
