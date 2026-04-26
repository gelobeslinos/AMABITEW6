import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, studentService, attendanceService, leaveRequestService, announcementService } from '../services/api';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Announcement {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  attachment_path?: string;
  attachment_type?: string;
  attachment_name?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalStudents: 0,
    todayAttendance: 0,
    pendingLeaveRequests: 0,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementViewModal, setShowAnnouncementViewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get user info from localStorage
  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();
  const canCreateAnnouncement = userInfo?.role === 'master' || userInfo?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employees, students, attendances, leaveRequests, announcementsData] = await Promise.all([
          employeeService.getAll(),
          studentService.getAll(),
          attendanceService.getAll(),
          leaveRequestService.getAll(),
          announcementService.getAll(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        
        const newStats = {
          totalEmployees: employees.length,
          totalStudents: students.length,
          todayAttendance: attendances.filter((a: any) => a.date === today).length,
          pendingLeaveRequests: leaveRequests.filter((lr: any) => lr.status === 'pending').length,
        };

        setStats(newStats);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Dashboard: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      const formData = new FormData();
      formData.append('title', announcementData.title);
      formData.append('message', announcementData.message);
      formData.append('target_audience', announcementData.target_audience);
      formData.append('is_active', announcementData.is_active ? '1' : '0');
      if (announcementData.expires_at && announcementData.expires_at !== '') {
        formData.append('expires_at', announcementData.expires_at);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      await announcementService.create(formData);
      // Refresh announcements
      const announcementsData = await announcementService.getAll();
      setAnnouncements(announcementsData);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  const handleUpdateAnnouncement = async (announcementData: any) => {
    try {
      const formData = new FormData();
      formData.append('title', announcementData.title);
      formData.append('message', announcementData.message);
      formData.append('target_audience', announcementData.target_audience);
      formData.append('is_active', announcementData.is_active ? '1' : '0');
      if (announcementData.expires_at && announcementData.expires_at !== '') {
        formData.append('expires_at', announcementData.expires_at);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }
      formData.append('_method', 'PUT');

      await announcementService.update(parseInt(editingAnnouncement!.id), formData);
      // Refresh announcements
      const announcementsData = await announcementService.getAll();
      setAnnouncements(announcementsData);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(parseInt(id));
        // Refresh announcements
        const announcementsData = await announcementService.getAll();
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif', gap: '20px' }}>
        <style>{`@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.92)}}`}</style>
        <img src="/1.jpg" alt="CCS" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ff6b35', boxShadow: '0 0 0 8px rgba(255,107,53,.15)', animation: 'blink 1.2s ease-in-out infinite' }} />
        <span style={{ fontSize: '15px', color: '#64748b', fontWeight: '500', letterSpacing: '.3px', fontFamily: 'Segoe UI, sans-serif' }}>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 32px)', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header card */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: '16px', padding: '24px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#ffffff', fontWeight: '700', fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'Segoe UI, sans-serif' }}>Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>System overview and quick access</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'Segoe UI, sans-serif' }}>System Active</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.totalEmployees}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Total Employees</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Total Students</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.todayAttendance}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Today's Attendance</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.pendingLeaveRequests}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Pending Requests</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => navigate('/employees')}
            style={{
              padding: '16px',
              background: '#fff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Segoe UI, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ff6b35';
              e.currentTarget.style.background = '#fff7ed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <PlusCircleIcon style={{ width: '20px', height: '20px', color: '#ff6b35' }} />
            <span>Add Employee</span>
          </button>
          
          <button
            onClick={() => navigate('/students')}
            style={{
              padding: '16px',
              background: '#fff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Segoe UI, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <AcademicCapIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <span>Add Student</span>
          </button>
          
          <button
            onClick={() => navigate('/attendance')}
            style={{
              padding: '16px',
              background: '#fff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Segoe UI, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.background = '#faf5ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <CalendarDaysIcon style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
            <span>Attendance</span>
          </button>
          
          <button
            onClick={() => navigate('/leave-requests')}
            style={{
              padding: '16px',
              background: '#fff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Segoe UI, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.background = '#fff7ed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            <span>Leave Requests</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>System Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>System Operational</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>All systems running normally</p>
          </div>
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Last Sync</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a' }}>{new Date().toLocaleTimeString()}</p>
          </div>
          <div style={{ padding: '16px', background: '#fefce8', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Performance</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>Response time under 200ms</p>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>Announcements</h2>
          {canCreateAnnouncement && (
            <button
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                color: '#fff',
                padding: '11px 20px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: 'Segoe UI, sans-serif',
                boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
            >
              <PlusCircleIcon style={{ width: '18px', height: '18px' }} />
              Create Announcement
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px'
              }}>📢</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif', marginBottom: '8px' }}>No Announcements Yet</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
                {canCreateAnnouncement 
                  ? 'Create your first announcement to keep everyone informed.'
                  : 'No announcements available at this time. Check back later for updates.'
                }
              </div>
            </div>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} style={{
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative'
              }}
              onClick={() => {
                setSelectedAnnouncement(announcement);
                setShowAnnouncementViewModal(true);
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#ff6b35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '4px',
                  height: '100%',
                  background: '#ff6b35',
                  borderRadius: '12px 0 0 12px'
                }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '16px', fontWeight: '600', fontFamily: 'Segoe UI, sans-serif' }}>
                      {announcement.title}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.4', fontFamily: 'Segoe UI, sans-serif' }}>
                      {announcement.message}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        background: '#ff6b35',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'capitalize',
                        fontWeight: '500'
                      }}>
                        {announcement.target_audience}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {canCreateAnnouncement && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAnnouncement(announcement);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(59,130,246,0.08)',
                          color: '#3b82f6',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#3b82f6'; }}
                      >
                        <PencilIcon style={{ width: '15px', height: '15px' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnnouncement(announcement.id);
                        }}
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
                        <TrashIcon style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
            setSelectedFile(null);
          }}
          onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
          editingAnnouncement={editingAnnouncement}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      )}

      {/* Announcement View Modal */}
      {showAnnouncementViewModal && selectedAnnouncement && (
        <AnnouncementViewModal
          announcement={selectedAnnouncement}
          onClose={() => {
            setShowAnnouncementViewModal(false);
            setSelectedAnnouncement(null);
          }}
        />
      )}
    </div>
  );
};

// Announcement Modal Component
const AnnouncementModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingAnnouncement: Announcement | null;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}> = ({ onClose, onSubmit, editingAnnouncement, selectedFile, setSelectedFile }) => {
  const [formData, setFormData] = useState({
    title: editingAnnouncement?.title || '',
    message: editingAnnouncement?.message || '',
    target_audience: editingAnnouncement?.target_audience || 'all',
    is_active: editingAnnouncement ? true : true,
    expires_at: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
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
          marginTop: '-32px', marginLeft: '-32px', marginRight: '-32px', marginBottom: '24px',
          padding: '24px 32px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>
            {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
          </h3>
          <button
            onClick={onClose}
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
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
              Target Audience
            </label>
            <select
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              <option value="all">All</option>
              <option value="employees">Employees</option>
              <option value="students">Students</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
              Attachment (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
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
              onFocus={(e) => { e.currentTarget.style.borderColor = '#ff6b35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
            {selectedFile && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
                Selected: {selectedFile.name}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
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
                background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Segoe UI, sans-serif',
                boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
            >
              {editingAnnouncement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Announcement View Modal Component
const AnnouncementViewModal: React.FC<{
  announcement: Announcement;
  onClose: () => void;
}> = ({ announcement, onClose }) => {
  const renderAttachment = () => {
    if (!announcement.attachment_path) return null;

    const attachmentUrl = `http://localhost:8000/${announcement.attachment_path}`;
    
    switch (announcement.attachment_type) {
      case 'image':
        return (
          <img
            src={attachmentUrl}
            alt={announcement.attachment_name}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          />
        );
      case 'video':
        return (
          <video
            controls
            style={{
              width: '100%',
              maxHeight: '400px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <source src={attachmentUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio controls style={{ width: '100%' }}>
            <source src={attachmentUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      default:
        return (
          <div style={{
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <DocumentTextIcon style={{ width: '48px', height: '48px', color: '#64748b', marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
              {announcement.attachment_name}
            </div>
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 16px',
                background: '#ff6b35',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Download
            </a>
          </div>
        );
    }
  };

  return (
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
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          marginTop: '-32px', marginLeft: '-32px', marginRight: '-32px', marginBottom: '24px',
          padding: '24px 32px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }}>
            {announcement.title}
          </h3>
          <button
            onClick={onClose}
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
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{
              fontSize: '12px',
              background: '#ff6b35',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'capitalize',
              fontWeight: '500'
            }}>
              {announcement.target_audience}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Segoe UI, sans-serif' }}>
              {new Date(announcement.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#374151', fontFamily: 'Segoe UI, sans-serif' }}>
            {announcement.message}
          </p>
        </div>

        {announcement.attachment_path && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'Segoe UI, sans-serif' }}>
              Attachment
            </h4>
            {renderAttachment()}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Segoe UI, sans-serif',
              boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
