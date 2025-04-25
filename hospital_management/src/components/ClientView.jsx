import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClient } from '../services/clientService';
import { format } from 'date-fns';
import styles from '../styles/ClientsView.module.css';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState('personal');

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const response = await getClient(id);
      console.log("Client data received:", response); // Debug log
      // Extract the actual client data from the response
      const clientData = response.data || response;
      setClient(clientData);
    } catch (err) {
      console.error("Error fetching client:", err); // Debug log
      setError(err.response?.data?.message || 'Error loading client details');
    } finally {
      setLoading(false);
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
      </div>
    </div>
  );
};

export default ClientDetail;