import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import styles from '../styles/clients.module.css';

const ClientRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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

  const { firstName, lastName, dateOfBirth, gender, contactNumber, address } = formData;

  const onChange = (e) => {
    if (e.target.name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await createClient(formData);
      navigate(`/clients/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Client Registration</h3>
          <p className={styles.subtitle}>
            Register a new client in the system
          </p>

          <Link to="/dashboard" className={styles.backLink}>
                      Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.formFieldHalf}>
              <label htmlFor="firstName" className={styles.label}>
                First name *
              </label>
              <div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={firstName}
                  onChange={onChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formFieldHalf}>
              <label htmlFor="lastName" className={styles.label}>
                Last name *
              </label>
              <div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={lastName}
                  onChange={onChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formFieldHalf}>
              <label htmlFor="dateOfBirth" className={styles.label}>
                Date of Birth *
              </label>
              <div>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={onChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formFieldHalf}>
              <label htmlFor="gender" className={styles.label}>
                Gender *
              </label>
              <div>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={onChange}
                  required
                  className={styles.input}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.formFieldHalf}>
              <label htmlFor="contactNumber" className={styles.label}>
                Contact Number
              </label>
              <div>
                <input
                  type="tel"
                  name="contactNumber"
                  id="contactNumber"
                  value={contactNumber}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className={styles.formFieldFull}>
              <h4 className={styles.sectionTitle}>Address Information</h4>
            </div>

            <div className={styles.formFieldFull}>
              <label htmlFor="address.street" className={styles.label}>
                Street Address
              </label>
              <div>
                <input
                  type="text"
                  name="address.street"
                  id="address.street"
                  value={address.street}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={`${styles.formField} ${styles.formFieldHalf}`}>
              <label htmlFor="address.city" className={styles.label}>
                City
              </label>
              <div>
                <input
                  type="text"
                  name="address.city"
                  id="address.city"
                  value={address.city}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={`${styles.formField} ${styles.formFieldHalf}`}>
              <label htmlFor="address.state" className={styles.label}>
                State / Province
              </label>
              <div>
                <input
                  type="text"
                  name="address.state"
                  id="address.state"
                  value={address.state}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={`${styles.formField} ${styles.formFieldHalf}`}>
              <label htmlFor="address.zipCode" className={styles.label}>
                ZIP / Postal Code
              </label>
              <div>
                <input
                  type="text"
                  name="address.zipCode"
                  id="address.zipCode"
                  value={address.zipCode}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.buttonCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.buttonSubmit}
            >
              {isLoading ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistration;