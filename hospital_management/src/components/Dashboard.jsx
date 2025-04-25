import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/dashboard.module.css';

// Component for displaying a stat card
const StatCard = ({ title, value, icon, color }) => {
  const borderColorClass = `${styles.statCard} ${styles[`border${color.replace('border-', '')}`]}`;
  
  return (
    <div className={borderColorClass}>
      <div className={styles.cardContent}>
        <div className="flex items-center">
          <div className={styles.cardIcon}>
            <span className={styles.cardIconText}>{icon}</span>
          </div>
          <div className={styles.cardText}>
            <dl>
              <dt className={styles.cardTitle}>{title}</dt>
              <dd>
                <div className={styles.cardValue}>{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for displaying recent enrollments
const RecentEnrollments = ({ enrollments }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Recent Enrollments</h3>
      </div>
      <div className={styles.sectionBorder}>
        <ul className={styles.list}>
          {enrollments.length > 0 ? (
            enrollments.map((enrollment, index) => (
              <li key={index} className={`${styles.listItem} ${styles.listItemBorder}`}>
                <div className="flex items-center justify-between w-full">
                  <div className={styles.clientName}>{enrollment.clientName}</div>
                  <div className={styles.programName}>{enrollment.programName}</div>
                  <div className={styles.enrollmentDate}>
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className={`${styles.listItem} ${styles.listItemBorder}`}>
              <div className={styles.noDataText}>No recent enrollments</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Component for displaying popular programs
const PopularPrograms = ({ programs }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Popular Programs</h3>
      </div>
      <div className={styles.sectionBorder}>
        <ul className={styles.list}>
          {programs.length > 0 ? (
            programs.map((prog, index) => (
              <li key={index} className={`${styles.listItem} ${styles.listItemBorder}`}>
                <div className="flex items-center justify-between w-full">
                  <div className={styles.programName}>{prog.program}</div>
                  <div className={styles.enrollmentCount}>{prog.count} clients enrolled</div>
                </div>
              </li>
            ))
          ) : (
            <li className={`${styles.listItem} ${styles.listItemBorder}`}>
              <div className={styles.noDataText}>No program data available</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Main Dashboard component
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPrograms: 0,
    totalDoctors: 0,
    recentClients: 0,
    activePrograms: 0,
    popularPrograms: [],
    recentEnrollments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        {/* Quick Action Buttons */}
        <div className={styles.quickActions}>
          <Link
            to="/programs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Program
          </Link>
          
          <Link
            to="/clients/register"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Register Client
          </Link>
          
          <Link
            to="/clients"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Search Clients
          </Link>
          
          <Link
            to="/programs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Manage Programs
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon="👥"
            color="border-blue-500"
          />
          <StatCard
            title="Total Programs"
            value={stats.totalPrograms}
            icon="📋"
            color="border-indigo-500"
          />
          <StatCard
            title="Active Programs"
            value={stats.activePrograms}
            icon="✅"
            color="border-green-500"
          />
          <StatCard
            title="Doctors"
            value={stats.totalDoctors}
            icon="👨‍⚕️"
            color="border-purple-500"
          />
          <StatCard
            title="Recent Clients"
            value={stats.recentClients}
            icon="🆕"
            color="border-yellow-500"
          />
        </div>
        
        {/* Program & Enrollment Info */}
        <div className={styles.infoGrid}>
          <PopularPrograms programs={stats.popularPrograms} />
          <RecentEnrollments enrollments={stats.recentEnrollments} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;