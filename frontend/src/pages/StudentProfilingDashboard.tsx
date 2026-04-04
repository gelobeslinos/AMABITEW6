import React, { useState, useEffect } from 'react';
import { studentProfileService } from '../services/api';
import { useToast } from '../components/ToastProvider';

interface StudentProfile {
  id: number;
  student_id: string;
  student: {
    id: number;
    student_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    program: string;
    year_level: number;
  };
  academic_profile: {
    learning_style: string;
    academic_strengths: string;
    academic_weaknesses: string;
    gpa: number;
    career_aspiration: string;
    personal_goals: string;
  };
  support_needs: {
    special_needs: any;
    counselor_notes: string;
    needs_intervention: boolean;
    intervention_notes: string;
  };
  activities: {
    extracurricular_activities: string[];
    leadership_experience: string;
    parent_contact_notes: string;
  };
  interests: Array<{
    id: number;
    interest_category: string;
    interest_name: string;
    proficiency_level: string;
    description: string;
    is_primary_interest: boolean;
    years_of_experience: number;
    achievements: string[];
  }>;
  created_at: string;
  updated_at: string;
}

interface FilterOptions {
  interests: string;
  interest_category: string;
  gpa_min: number;
  gpa_max: number;
  needs_intervention: boolean;
  learning_style: string;
  search: string;
}

const StudentProfilingDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    interests: '',
    interest_category: '',
    gpa_min: 0,
    gpa_max: 4.0,
    needs_intervention: false,
    learning_style: '',
    search: ''
  });
  const [popularInterests, setPopularInterests] = useState<any>({});
  const toast = useToast();

  useEffect(() => {
    fetchProfiles();
    fetchPopularInterests();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await studentProfileService.getAll(filters);
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching student profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularInterests = async () => {
    try {
      const data = await studentProfileService.getPopularInterests();
      setPopularInterests(data);
    } catch (error) {
      console.error('Error fetching popular interests:', error);
    }
  };

  const handleFilterChange = (field: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      interests: '',
      interest_category: '',
      gpa_min: 0,
      gpa_max: 4.0,
      needs_intervention: false,
      learning_style: '',
      search: ''
    });
  };

  const applyFilters = () => {
    fetchProfiles();
  };

  const generateMissingProfiles = async () => {
    try {
      setGenerating(true);
      const result = await studentProfileService.generateMissingProfiles();
      console.log('Generated profiles:', result);
      toast.success(`Successfully generated ${result.profiles_generated} student profiles!`);
      fetchProfiles(); // Refresh the profiles list
    } catch (error) {
      console.error('Error generating profiles:', error);
      toast.error('Failed to generate profiles. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading student profiles...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#2c3e50', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Student Profiling Management System
        </h1>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '20px' }}>
            🔍 Filter Students
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Specific Interests (comma-separated)
              </label>
              <input
                type="text"
                value={filters.interests}
                onChange={(e) => handleFilterChange('interests', e.target.value)}
                placeholder="e.g., basketball, programming, mobile_games"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Interest Category
              </label>
              <select
                value={filters.interest_category}
                onChange={(e) => handleFilterChange('interest_category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Categories</option>
                {Object.keys(popularInterests.interests || {}).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                GPA Range
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  value={filters.gpa_min}
                  onChange={(e) => handleFilterChange('gpa_min', parseFloat(e.target.value))}
                  placeholder="Min GPA"
                  min="0"
                  max="4"
                  step="0.1"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <span style={{ alignSelf: 'center', color: '#6c757d' }}>to</span>
                <input
                  type="number"
                  value={filters.gpa_max}
                  onChange={(e) => handleFilterChange('gpa_max', parseFloat(e.target.value))}
                  placeholder="Max GPA"
                  min="0"
                  max="4"
                  step="0.1"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Search Students
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or student ID..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={applyFilters}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={generateMissingProfiles}
              disabled={generating}
              style={{
                padding: '10px 20px',
                backgroundColor: generating ? '#ffc107' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.7 : 1
              }}
            >
              {generating ? 'Generating...' : '🚀 Generate Missing Profiles'}
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa'
          }}>
            <h2 style={{ fontSize: '18px', color: '#2c3e50', margin: '0' }}>
              📊 Found {profiles.length} Students
            </h2>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {profiles.map(profile => (
              <div key={profile.id} style={{
                padding: '20px',
                borderBottom: '1px solid #dee2e6',
                borderLeft: '4px solid #007bff',
                backgroundColor: '#fff',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '16px', 
                      color: '#2c3e50', 
                      margin: '0 0 10px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span>{profile.student.full_name}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        ID: {profile.student.student_id}
                      </span>
                    </h3>
                    
                    <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>
                      <strong>Program:</strong> {profile.student.program}<br/>
                      <strong>Year Level:</strong> {profile.student.year_level}<br/>
                      <strong>Email:</strong> {profile.student.email}<br/>
                      <strong>GPA:</strong> {profile.academic_profile.gpa?.toFixed(2) || 'N/A'}
                    </p>

                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#2c3e50' }}>Career Aspiration:</strong>
                      <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        {profile.academic_profile.career_aspiration}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', color: '#2c3e50', marginBottom: '10px' }}>
                      🎯 Interests & Skills
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {profile.interests.map(interest => (
                        <span key={interest.id} style={{
                          fontSize: '12px',
                          backgroundColor: interest.is_primary_interest ? '#ff6b35' : '#17a2b8',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          border: interest.is_primary_interest ? '2px solid #ff6b35' : 'none'
                        }}>
                          {interest.interest_name} ({interest.proficiency_level})
                        </span>
                      ))}
                    </div>
                    
                    {profile.interests.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        <strong>Categories:</strong> {[
                          ...new Set(profile.interests.map(i => i.interest_category))
                        ].join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '14px', color: '#2c3e50', marginBottom: '10px' }}>
                    📚 Academic Profile
                  </h4>
                  <div style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.5' }}>
                    <p><strong>Learning Style:</strong> {profile.academic_profile.learning_style || 'Not specified'}</p>
                    <p><strong>Strengths:</strong> {profile.academic_profile.academic_strengths || 'Not specified'}</p>
                    <p><strong>Areas for Improvement:</strong> {profile.academic_profile.academic_weaknesses || 'Not specified'}</p>
                    <p><strong>Goals:</strong> {profile.academic_profile.personal_goals || 'Not specified'}</p>
                  </div>

                  {profile.support_needs.needs_intervention && (
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: '6px'
                    }}>
                      <h4 style={{ fontSize: '14px', color: '#856404', marginBottom: '5px' }}>
                        ⚠️ Intervention Required
                      </h4>
                      <p style={{ margin: '0', fontSize: '13px', color: '#856404' }}>
                        {profile.support_needs.intervention_notes || 'Student requires additional support'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilingDashboard;
