import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, updateClient } from '../services/clientService';
import styles from '../styles/edit.module.css';

const ClientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await getClient(id);
      // Extract actual client data from the response
      const data = response.data || response;
      
      let formattedDate = '';
      if (data.dateOfBirth) {
        const date = new Date(data.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: formattedDate,
        gender: data.gender || '',
        contactNumber: data.contactNumber || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || data.address?.zip || ''
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading client data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateClient(id, formData);
      navigate(`/clients/${id}`);
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || 'Error updating client');
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} aria-hidden="true"></div>
          <p className="mt-2">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="mb-6">
        <Link to={`/clients/${id}`} className={styles.backLink}>
          &larr; Back to client details
        </Link>
        <h1 className={styles.title}>
          Edit Client: {formData.firstName} {formData.lastName}
        </h1>
      </div>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className={styles.sectionTitle}>Client Information</h3>
              <div className={styles.grid}>
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className={styles.label}>
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className={styles.label}>
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dateOfBirth" className={styles.label}>
                    Date of Birth
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="gender" className={styles.label}>
                    Gender
                  </label>
                  <div className="mt-1">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="contactNumber" className={styles.label}>
                    Contact Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="contactNumber"
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-8">
              <h3 className={styles.sectionTitle}>Address</h3>
              <div className={styles.grid}>
                <div className="sm:col-span-6">
                  <label htmlFor="address.street" className={styles.label}>
                    Street Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address.street"
                      id="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.city" className={styles.label}>
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address.city"
                      id="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.state" className={styles.label}>
                    State / Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address.state"
                      id="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.zipCode" className={styles.label}>
                    ZIP / Postal Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address.zipCode"
                      id="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <Link
                to={`/clients/${id}`}
                className={styles.cancelButton}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientEdit;