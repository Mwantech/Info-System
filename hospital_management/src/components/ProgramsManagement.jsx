import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../services/programService';
import modalStyles from '../styles/programs.module.css';
import styles from '../styles/programs.module.css';

// Modal component for creating/editing programs
const ProgramModal = ({ isOpen, onClose, program, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
        description: program.description || '',
        active: program.active !== undefined ? program.active : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        active: true
      });
    }
  }, [program]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>
            {program ? 'Edit Program' : 'Create New Program'}
          </h2>
          <button
            onClick={onClose}
            className={modalStyles.closeButton}
          >
            <svg className={modalStyles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {error && (
          <div className={modalStyles.errorMessage}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label} htmlFor="name">
              Program Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={modalStyles.input}
              placeholder="Enter program name"
            />
          </div>
          
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={modalStyles.textarea}
              placeholder="Describe the program"
            />
          </div>
          
          <div className={modalStyles.checkboxContainer}>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className={modalStyles.checkbox}
            />
            <span className={modalStyles.checkboxLabel}>Active Program</span>
          </div>
          
          <div className={modalStyles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={modalStyles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={modalStyles.submitButton}
            >
              {isSubmitting ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Programs Management component
const ProgramsManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await getPrograms();
      if (response.success) {
        setPrograms(response.data);
      }
    } catch (err) {
      setError('Failed to load programs');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (program = null) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProgram(null);
    setIsModalOpen(false);
  };

  const handleSaveProgram = async (formData) => {
    try {
      if (selectedProgram) {
        // Update existing program
        await updateProgram(selectedProgram._id, formData);
      } else {
        // Create new program
        await createProgram(formData);
      }
      // Refresh programs list
      fetchPrograms();
    } catch (err) {
      console.error('Error saving program:', err);
      throw err;
    }
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await deleteProgram(id);
        // Refresh programs list
        fetchPrograms();
      } catch (err) {
        setError('Failed to delete program. Make sure no clients are enrolled.');
        console.error('Error deleting program:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading programs...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Programs Management</h1>
          <Link to="/dashboard" className={styles.backLink}>
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      <main className={styles.main}>
        {error && (
          <div className={styles.errorContainer}>
            {error}
            <button 
              className={styles.errorCloseButton} 
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        <div className={styles.createButtonContainer}>
          <button
            onClick={() => handleOpenModal()}
            className={styles.createButton}
          >
            <svg className={styles.createButtonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Program
          </button>
        </div>
        
        {/* Programs List */}
        <div className={styles.programsList}>
          {programs.length > 0 ? (
            <ul>
              {programs.map((program) => (
                <li key={program._id} className={styles.programItem}>
                  <div className={styles.programContent}>
                    <div className={styles.programHeader}>
                      <div className={styles.programNameContainer}>
                        <div className={`${styles.statusIndicator} ${program.active ? styles.statusActive : styles.statusInactive}`}></div>
                        <p className={styles.programName}>{program.name}</p>
                      </div>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleOpenModal(program)}
                          className={styles.editButton}
                        >
                          <svg className={styles.actionIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program._id)}
                          className={styles.deleteButton}
                        >
                          <svg className={styles.actionIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={styles.programDetails}>
                      <p className={styles.programDescription}>
                        {program.description}
                      </p>
                      <div className={styles.programDate}>
                        <p>
                          Created: {new Date(program.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyMessage}>
              No programs found. Create your first health program.
            </div>
          )}
        </div>
      </main>
      
      {/* Program Modal for Create/Edit */}
      <ProgramModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        program={selectedProgram}
        onSave={handleSaveProgram}
      />
    </div>
  );
};

export default ProgramsManagement;