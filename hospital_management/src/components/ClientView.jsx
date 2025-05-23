import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClient, enrollClientInProgram, removeClientFromProgram, updateEnrollmentStatus } from '../services/clientService';
import { getPrograms } from '../services/programService'; // Import the getPrograms function
import { format } from 'date-fns';
import styles from '../styles/ClientsView.module.css';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState('personal');
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    fetchClientDetails();
    fetchAvailablePrograms();
  }, [id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const response = await getClient(id);
      console.log("Client data received:", response); // Debug log
      // Extract the actual client data from the response
      const clientData = response.data || response;
      setClient(clientData);
      
      // If client has enrollments, set them to the programs state
      if (clientData.enrollments && clientData.enrollments.length > 0) {
        setPrograms(clientData.enrollments);
      }
    } catch (err) {
      console.error("Error fetching client:", err); // Debug log
      setError(err.response?.data?.message || 'Error loading client details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePrograms = async () => {
    setLoadingPrograms(true);
    try {
      // Use the getPrograms function from the programService instead of direct fetch
      const response = await getPrograms();
      console.log("Programs data received:", response); // Debug log
      
      if (response.success) {
        // Filter active programs only if needed
        const activePrograms = response.data.filter(program => program.active);
        setAvailablePrograms(activePrograms);
      } else {
        // If API returns all programs without a filter
        setAvailablePrograms(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleEnrollProgram = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setEnrollmentLoading(true);
    setEnrollmentMessage('');
    
    try {
      const response = await enrollClientInProgram(id, { programId: selectedProgram });
      
      if (response.success) {
        // Update client data with new enrollment
        setClient(response.data);
        setPrograms(response.data.enrollments);
        setSelectedProgram('');
        setEnrollmentMessage('Client successfully enrolled in program');
        
        // Refresh client details
        fetchClientDetails();
      }
    } catch (err) {
      console.error("Error enrolling client in program:", err);
      setEnrollmentMessage(err.response?.data?.message || 'Error enrolling client in program');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleRemoveFromProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to remove the client from this program?')) {
      return;
    }
    
    try {
      const response = await removeClientFromProgram(id, programId);
      
      if (response.success) {
        // Update client data with removed enrollment
        setClient(response.data);
        setPrograms(response.data.enrollments);
        setEnrollmentMessage('Client removed from program successfully');
        
        // Refresh client details
        fetchClientDetails();
      }
    } catch (err) {
      console.error("Error removing client from program:", err);
      setEnrollmentMessage(err.response?.data?.message || 'Error removing client from program');
    }
  };

  const handleUpdateStatus = async (programId, newStatus) => {
    try {
      const response = await updateEnrollmentStatus(id, programId, { status: newStatus });
      
      if (response.success) {
        // Update client data with updated enrollment status
        setClient(response.data);
        setPrograms(response.data.enrollments);
        setEnrollmentMessage(`Enrollment status updated to ${newStatus}`);
        
        // Refresh client details
        fetchClientDetails();
      }
    } catch (err) {
      console.error("Error updating enrollment status:", err);
      setEnrollmentMessage(err.response?.data?.message || 'Error updating enrollment status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not available';
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return 'Not available';
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Not available';
    
    try {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return 'Not available';
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970) + ' years';
    } catch (error) {
      return 'Not available';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className={styles.loadingText}>Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage} role="alert">
          <strong className={styles.errorTitle}>Error!</strong>
          <span> {error}</span>
        </div>
        <div className={styles.backLinkContainer}>
          <Link to="/clients" className={styles.backLink}>
            &larr; Back to client list
          </Link>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>Client not found.</p>
          <div className={styles.backLinkContainer}>
            <Link to="/clients" className={styles.backLink}>
              &larr; Back to client list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link to="/clients" className={styles.backLink}>
            &larr; Back to client list
          </Link>
          <h1 className={styles.clientName}>
            {client.firstName} {client.lastName}
          </h1>
        </div>
        <div className={styles.actionButtons}>
          <Link
            to={`/clients/${id}/edit`}
            className={styles.editButton}
          >
            Edit Client
          </Link>
        </div>
      </div>

      <div className={styles.card}>
        {/* Tab Navigation */}
        <div className={styles.tabBar}>
          <nav className={styles.tabNav}>
            <button
              className={`${styles.tabButton} ${
                expandedSection === 'personal' ? styles.activeTab : ''
              }`}
              onClick={() => setExpandedSection('personal')}
            >
              Personal Information
            </button>
            <button
              className={`${styles.tabButton} ${
                expandedSection === 'programs' ? styles.activeTab : ''
              }`}
              onClick={() => setExpandedSection('programs')}
            >
              Programs
            </button>
          </nav>
        </div>

        {/* Personal Information Section */}
        {expandedSection === 'personal' && (
          <div className={styles.sectionContent}>
            <div className={styles.infoGrid}>
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <dl className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Full Name</dt>
                    <dd className={styles.infoValue}>{client.firstName} {client.lastName}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Gender</dt>
                    <dd className={styles.infoValue}>
                      {client.gender ? (client.gender.charAt(0).toUpperCase() + client.gender.slice(1)) : 'Not available'}
                    </dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Date of Birth</dt>
                    <dd className={styles.infoValue}>{formatDate(client.dateOfBirth)}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Age</dt>
                    <dd className={styles.infoValue}>{calculateAge(client.dateOfBirth)}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Registration Date</dt>
                    <dd className={styles.infoValue}>{formatDate(client.createdAt || client.dateRegistered)}</dd>
                  </div>
                </dl>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                <dl className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Phone Number</dt>
                    <dd className={styles.infoValue}>{client.contactNumber || 'Not available'}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Email Address</dt>
                    <dd className={styles.infoValue}>{client.email || 'Not available'}</dd>
                  </div>
                  <div className={styles.infoItem}>
                    <dt className={styles.infoLabel}>Address</dt>
                    <dd className={styles.infoValue}>
                      {client.address ? (
                        <>
                          {client.address.street && <div>{client.address.street}</div>}
                          {client.address.city && client.address.state && (
                            <div>
                              {client.address.city}, {client.address.state} {client.address.zipCode || client.address.zip}
                            </div>
                          )}
                        </>
                      ) : (
                        'Not available'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {client.emergencyContact && (
                <div className={styles.fullWidthSection}>
                  <h3 className={styles.sectionTitle}>Emergency Contact</h3>
                  <dl className={styles.emergencyContactGrid}>
                    <div className={styles.infoItem}>
                      <dt className={styles.infoLabel}>Name</dt>
                      <dd className={styles.infoValue}>{client.emergencyContact.name || 'Not available'}</dd>
                    </div>
                    <div className={styles.infoItem}>
                      <dt className={styles.infoLabel}>Relationship</dt>
                      <dd className={styles.infoValue}>{client.emergencyContact.relationship || 'Not available'}</dd>
                    </div>
                    <div className={styles.infoItem}>
                      <dt className={styles.infoLabel}>Phone</dt>
                      <dd className={styles.infoValue}>{client.emergencyContact.phone || 'Not available'}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Programs Section */}
        {expandedSection === 'programs' && (
          <div className={styles.sectionContent}>
            <div className={styles.programsContainer}>
              <h3 className={styles.sectionTitle}>Client Programs</h3>
              
              {/* Enroll in Program Form */}
              <div className={styles.enrollForm}>
                <h4>Enroll in New Program</h4>
                <form onSubmit={handleEnrollProgram} className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="program" className={styles.formLabel}>Select Program</label>
                    <select
                      id="program"
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className={styles.formSelect}
                      disabled={enrollmentLoading || loadingPrograms}
                    >
                      <option value="">Select a program</option>
                      {availablePrograms.length > 0 ? (
                        availablePrograms.map((program) => (
                          <option key={program._id} value={program._id}>
                            {program.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No available programs</option>
                      )}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className={styles.enrollButton}
                    disabled={!selectedProgram || enrollmentLoading}
                  >
                    {enrollmentLoading ? 'Enrolling...' : 'Enroll'}
                  </button>
                </form>
                
                {loadingPrograms && (
                  <div className={styles.loadingMessage}>
                    Loading available programs...
                  </div>
                )}
                
                {enrollmentMessage && (
                  <div className={styles.messageAlert} role="alert">
                    {enrollmentMessage}
                  </div>
                )}
              </div>
              
              {/* Enrolled Programs List */}
              <div className={styles.programsList}>
                <h4>Enrolled Programs</h4>
                {programs && programs.length > 0 ? (
                  <div className={styles.programsTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Program Name</th>
                          <th>Description</th>
                          <th>Enrollment Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map((enrollment) => (
                          <tr key={enrollment._id || (enrollment.program && enrollment.program._id) || Math.random()}>
                            <td>{enrollment.program && enrollment.program.name}</td>
                            <td>{enrollment.program && enrollment.program.description}</td>
                            <td>{formatDate(enrollment.enrollmentDate)}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles[enrollment.status]}`}>
                                {enrollment.status}
                              </span>
                            </td>
                            <td className={styles.actionCell}>
                              <div className={styles.actionDropdown}>
                                <select
                                  className={styles.statusSelect}
                                  value={enrollment.status}
                                  onChange={(e) => handleUpdateStatus(enrollment.program && enrollment.program._id, e.target.value)}
                                >
                                  <option value="active">Active</option>
                                  <option value="completed">Completed</option>
                                  <option value="withdrawn">Withdrawn</option>
                                </select>
                                <button
                                  onClick={() => handleRemoveFromProgram(enrollment.program && enrollment.program._id)}
                                  className={styles.removeButton}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.noPrograms}>
                    <p>Client is not enrolled in any programs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;