import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, studentService, attendanceService, leaveRequestService, announcementService } from '../services/api';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartPieIcon,
  MegaphoneIcon,
  XMarkIcon,
  UserCircleIcon,
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

      console.log('FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
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
      console.error('Error response:', (error as any).response?.data);
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

      console.log('FormData being sent for update:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await announcementService.update(parseInt(editingAnnouncement!.id), formData);
      // Refresh announcements
      const announcementsData = await announcementService.getAll();
      setAnnouncements(announcementsData);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      console.error('Error response:', (error as any).response?.data);
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Total Employees
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {stats.totalEmployees}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <UserGroupIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Staff Members
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Total Students
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <AcademicCapIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Enrolled Students
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Today's Attendance
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {stats.todayAttendance}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <CalendarDaysIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Present Today
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Pending Requests
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {stats.pendingLeaveRequests}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <DocumentTextIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Leave Requests
          </div>
        </div>
      </div>

      {/* Quick Actions and System Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 20px', 
            fontSize: '18px', 
            color: '#2c3e50',
            fontWeight: '600'
          }}>
            Quick Actions
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate('/employees')}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PlusCircleIcon style={{ width: '20px', height: '20px' }} />
              Add New Employee
            </button>
            
            <button
              onClick={() => navigate('/students')}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #dcfce7',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AcademicCapIcon style={{ width: '20px', height: '20px' }} />
              Add New Student
            </button>
            
            <button
              onClick={() => navigate('/attendance')}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#faf5ff',
                color: '#7c3aed',
                border: '1px solid #f3e8ff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
              Mark Attendance
            </button>
            
            <button
              onClick={() => navigate('/leave-requests')}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <DocumentTextIcon style={{ width: '20px', height: '20px' }} />
              Review Leave Requests
            </button>
          </div>
        </div>

        {/* System Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 20px', 
            fontSize: '18px', 
            color: '#2c3e50',
            fontWeight: '600'
          }}>
            System Status
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              borderLeft: '4px solid #28a745'
            }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#155724', 
                marginBottom: '4px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                System Operational
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#155724'
              }}>
                All systems are running normally.
              </div>
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: '#d1ecf1',
              borderRadius: '8px',
              borderLeft: '4px solid #17a2b8'
            }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#0c5460', 
                marginBottom: '4px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ClockIcon style={{ width: '20px', height: '20px' }} />
                Last Sync
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#0c5460'
              }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              borderLeft: '4px solid #ffc107'
            }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#856404', 
                marginBottom: '4px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ChartPieIcon style={{ width: '20px', height: '20px' }} />
                Performance
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#856404'
              }}>
                Response time under 200ms
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              color: '#2c3e50',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MegaphoneIcon style={{ width: '20px', height: '20px' }} />
              Announcements
            </h2>
            {canCreateAnnouncement && (
              <button
                onClick={() => setShowAnnouncementModal(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircleIcon style={{ width: '16px', height: '16px' }} />
                Create Announcement
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {announcements.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <MegaphoneIcon style={{ width: '40px', height: '40px', color: '#ffffff', marginBottom: '15px' }} />
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  No Announcements Yet
                </h3>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  {canCreateAnnouncement 
                    ? 'Create your first announcement to keep everyone informed.'
                    : 'No announcements available at this time. Check back later for updates.'
                  }
                </p>
              </div>
            ) : (
              announcements.map(announcement => {
                return (
                  <div key={announcement.id} style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #6c757d',
                    border: '1px solid #dee2e6',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setShowAnnouncementViewModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '14px' }}>
                          {announcement.title}
                        </h4>
                        <p style={{ margin: '0', color: '#6c757d', fontSize: '12px' }}>
                          {announcement.message}
                        </p>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{
                            fontSize: '10px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {announcement.target_audience}
                          </span>
                        </div>
                        {canCreateAnnouncement && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAnnouncement(announcement);
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnnouncement(announcement.id);
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#6c757d',
                        marginLeft: '10px',
                        textAlign: 'right'
                      }}>
                        <div>
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          {new Date(announcement.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#2c3e50' }}>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  <XMarkIcon style={{ width: '24px', height: '24px' }} />
                </button>
              </div>

              <AnnouncementForm
                onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                onCancel={() => {
                  setShowAnnouncementModal(false);
                  setEditingAnnouncement(null);
                  setSelectedFile(null);
                }}
                editingAnnouncement={editingAnnouncement}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            </div>
          </div>
        )}

        {/* Announcement View Modal */}
        {showAnnouncementViewModal && selectedAnnouncement && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  color: '#2c3e50',
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>
                  {selectedAnnouncement.title}
                </h2>
                <button
                  onClick={() => {
                    setShowAnnouncementViewModal(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'capitalize'
                }}>
                  {selectedAnnouncement.target_audience}
                </span>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                </span>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {new Date(selectedAnnouncement.created_at).toLocaleTimeString()}
                </span>
                {selectedAnnouncement.attachment_type && (
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {selectedAnnouncement.attachment_type}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#2c3e50',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px'
              }}>
                {selectedAnnouncement.message}
              </div>

              {/* Attachment Display */}
              {selectedAnnouncement.attachment_path && selectedAnnouncement.attachment_type && (
                <div style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2c3e50' }}>
                    Attachment: {selectedAnnouncement.attachment_name}
                  </h4>
                  {selectedAnnouncement.attachment_type === 'image' && (
                    <img
                      src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`}
                      alt={selectedAnnouncement.attachment_name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        console.error('Image URL:', `http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully');
                      }}
                    />
                  )}
                  {selectedAnnouncement.attachment_type === 'video' && (
                    <video
                      controls
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Video failed to load:', e);
                      }}
                    >
                      <source src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`} />
                      Your browser does not support video tag.
                    </video>
                  )}
                  {selectedAnnouncement.attachment_type === 'audio' && (
                    <audio
                      controls
                      style={{
                        width: '100%',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Audio failed to load:', e);
                      }}
                    >
                      <source src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`} />
                      Your browser does not support audio element.
                    </audio>
                  )}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  onClick={() => {
                    setShowAnnouncementViewModal(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
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
        )}
      </div>
    </div>
  );
};

// Announcement Form Component
const AnnouncementForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingAnnouncement?: Announcement | null;
  selectedFile?: File | null;
  setSelectedFile?: (file: File | null) => void;
}> = ({ onSubmit, onCancel, editingAnnouncement, selectedFile, setSelectedFile }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    is_active: true,
    expires_at: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        target_audience: editingAnnouncement.target_audience,
        is_active: true,
        expires_at: ''
      });
    } else {
      setFormData({
        title: '',
        message: '',
        target_audience: 'all',
        is_active: true,
        expires_at: ''
      });
    }
  }, [editingAnnouncement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Selected file:', selectedFile);
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }
    
    console.log('Validation passed, submitting form');
    const submissionData = {
      ...formData,
      expires_at: formData.expires_at || null
    };
    onSubmit(submissionData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleInputChange('title')}
          placeholder="Enter announcement title"
          style={{
            width: '100%',
            padding: '10px',
            border: errors.title ? '2px solid #e74c3c' : '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {errors.title && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.title}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Message *
        </label>
        <textarea
          value={formData.message}
          onChange={handleInputChange('message')}
          placeholder="Enter your announcement message"
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: errors.message ? '2px solid #e74c3c' : '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
        {errors.message && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.message}
          </div>
        )}
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Target Audience
        </label>
        <select
          value={formData.target_audience}
          onChange={handleInputChange('target_audience')}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="all">All Users</option>
          <option value="students">Students Only</option>
          <option value="faculty">Faculty Only</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Attachment (Optional)
        </label>
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={(e) => {
            console.log('File input changed');
            const file = e.target.files?.[0];
            console.log('Selected file:', file);
            if (file) {
              console.log('File details:', {
                name: file.name,
                size: file.size,
                type: file.type
              });
              // Check file size (10MB max)
              if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                e.target.value = '';
                return;
              }
              console.log('File accepted, setting selected file');
              setSelectedFile?.(file);
            } else {
              console.log('No file selected');
            }
          }}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {selectedFile && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        {editingAnnouncement?.attachment_name && !selectedFile && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
            Current attachment: {editingAnnouncement.attachment_name}
          </div>
        )}
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Expires At (Optional)
        </label>
        <input
          type="datetime-local"
          value={formData.expires_at}
          onChange={handleInputChange('expires_at')}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
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
            padding: '10px 20px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
        </button>
      </div>
    </form>
  );
};

export default Dashboard;
