import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getClients, deleteClient } from '../services/clientService';
import { format } from 'date-fns';
import styles from '../styles/clients.module.css';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    clientId: null,
    clientName: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const query = searchParams.get('query') || '';

  useEffect(() => {
    fetchClients(page, query);
  }, [page, query]);

  useEffect(() => {
    // Set the search query from URL when component mounts
    if (query) {
      setSearchQuery(query);
    }
  }, [query]);

  const fetchClients = async (currentPage, searchTerm) => {
    setLoading(true);
    try {
      const response = await getClients(currentPage, 10, searchTerm);
      setClients(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  // Modified to trigger search automatically on input change with debounce
  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    
    // Debounce the search to avoid too many requests while typing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      navigate(`/clients?page=1&query=${encodeURIComponent(newSearchQuery)}`);
    }, 500); // Wait 500ms after typing stops before searching
  };

  // This function will handle clearing the search when clicking on a client
  const handleClientClick = () => {
    setSearchQuery('');
    navigate('/clients?page=1');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    navigate(`/clients?page=${newPage}${query ? `&query=${encodeURIComponent(query)}` : ''}`);
  };

  // Helper function to safely format dates
  const formatCreatedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      // Format to a readable date format
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Not available';
    }
  };
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    try {
      const dob = new Date(dateOfBirth);
      // Check if date is valid before calculating age
      if (!isNaN(dob.getTime())) {
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} years`;
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  };

  // New functions for delete functionality
  const openDeleteConfirmation = (clientId, firstName, lastName) => {
    setDeleteConfirmation({
      isOpen: true,
      clientId,
      clientName: `${firstName} ${lastName}`
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      clientId: null,
      clientName: ''
    });
  };

  const handleDeleteClient = async () => {
    if (!deleteConfirmation.clientId) return;

    try {
      await deleteClient(deleteConfirmation.clientId);
      
      // Refresh the client list
      fetchClients(page, query);
      
      // Show success message (could use a toast notification system)
      setError('');
      
      // Close the confirmation dialog
      closeDeleteConfirmation();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting client');
      closeDeleteConfirmation();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Clients</h3>
            <p className={styles.subtitle}>
              Search and manage client records
            </p>
          </div>
          <Link
            to="/clients/register"
            className={styles.registerButton}
          >
            Register New Client
          </Link>

          <Link to="/dashboard" className={styles.backLink}>
            Back to Dashboard
          </Link>
        </div>

        {/* Modified Search Bar - removed form and submit button */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or contact number"
            className={styles.searchInput}
          />
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className={styles.loadingText}>Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No clients found{query ? ` matching "${query}"` : ''}.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Gender</th>
                  <th className={styles.tableHeaderCell}>Age</th>
                  <th className={styles.tableHeaderCell}>Contact</th>
                  <th className={styles.tableHeaderCell}>Programs</th>
                  <th className={styles.tableHeaderCell}>Registered</th>
                  <th className={styles.tableHeaderCell}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.clientName}>
                        {client.firstName} {client.lastName}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellText}>
                        {client.gender ? (client.gender.charAt(0).toUpperCase() + client.gender.slice(1)) : 'Unknown'}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellText}>
                        {calculateAge(client.dateOfBirth)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellText}>{client.contactNumber || 'N/A'}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellText}>
                        {client.enrollments?.length > 0 ? client.enrollments.length : 'None'}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellText}>
                        {formatCreatedDate(client.createdAt || client.dateRegistered)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <Link 
                          to={`/clients/${client._id}`} 
                          className={styles.viewButton}
                          onClick={handleClientClick}
                        >
                          View
                        </Link>
                        <Link 
                          to={`/clients/${client._id}/edit`} 
                          className={styles.editButton}
                          onClick={handleClientClick}
                        >
                          Edit
                        </Link>
                        <button
                          className={styles.deleteButton}
                          onClick={() => openDeleteConfirmation(client._id, client.firstName, client.lastName)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && clients.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationMobile}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`${styles.paginationButton} ${page === 1 ? styles.disabled : ''}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.pages}
                className={`${styles.paginationButton} ${page === pagination.pages ? styles.disabled : ''}`}
              >
                Next
              </button>
            </div>
            <div className={styles.paginationDesktop}>
              <div>
                <p className={styles.paginationInfo}>
                  Showing <span className={styles.paginationInfoHighlight}>{((page - 1) * 10) + 1}</span> to{' '}
                  <span className={styles.paginationInfoHighlight}>
                    {Math.min(page * 10, pagination.total)}
                  </span>{' '}
                  of <span className={styles.paginationInfoHighlight}>{pagination.total}</span> results
                </p>
              </div>
              <div className={styles.paginationControls}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`${styles.paginationArrow} ${page === 1 ? styles.disabled : ''}`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className={styles.paginationIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  // For simplicity, show maximum 5 page buttons
                  let pageNum;
                  if (pagination.pages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    // If near the start
                    pageNum = i + 1;
                  } else if (page >= pagination.pages - 2) {
                    // If near the end
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    // If in the middle
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`${styles.pageNumber} ${page === pageNum ? styles.activePage : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className={`${styles.paginationArrow} ${page === pagination.pages ? styles.disabled : ''}`}
                >
                  <span className="sr-only">Next</span>
                  <svg className={styles.paginationIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} role="dialog" aria-labelledby="delete-confirmation-title">
              <div className={styles.modalContent}>
                <h4 id="delete-confirmation-title" className={styles.modalTitle}>Confirm Delete</h4>
                <p className={styles.modalText}>
                  Are you sure you want to delete {deleteConfirmation.clientName}? This action cannot be undone.
                </p>
                <div className={styles.modalActions}>
                  <button
                    onClick={closeDeleteConfirmation}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    className={styles.confirmDeleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;