import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/dashboard.module.css';
import { 
  Plus, 
  Search, 
  FileText, 
  LogOut,
  Users, 
  Clipboard, 
  CheckCircle, 
  UserPlus, 
  Star,
  UserCog
} from 'lucide-react';

// Component for displaying a stat card
const StatCard = ({ title, value, icon, color }) => {
  const borderColorClass = `${styles.statCard} ${styles[`border${color.replace('border-', '')}`]}`;
  
  return (
    <div className={borderColorClass}>
      <div className={styles.cardContent}>
        <div className="flex items-center">
          <div className={`${styles.cardIcon} ${styles[`bg${color.replace('border-', '')}`]}`}>
            {icon}
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
        <div className="flex items-center">
          <UserPlus className={styles.sectionIcon} size={18} />
          <h3 className={styles.sectionTitle}>Recent Enrollments</h3>
        </div>
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
        <div className="flex items-center">
          <Star className={styles.sectionIcon} size={18} />
          <h3 className={styles.sectionTitle}>Popular Programs</h3>
        </div>
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
        <div className={styles.loadingSpinner}></div>
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
            <span className={styles.welcomeText}>Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <LogOut size={16} className={styles.buttonIcon} />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        {/* Quick Action Buttons */}
        <div className={styles.quickActions}>
          <Link to="/programs/new" className={`${styles.actionButton} ${styles.indigo}`}>
            <Plus size={18} className={styles.buttonIcon} />
            Create Program
          </Link>
          
          <Link to="/clients/register" className={`${styles.actionButton} ${styles.green}`}>
            <UserPlus size={18} className={styles.buttonIcon} />
            Register Client
          </Link>
          
          <Link to="/clients" className={`${styles.actionButton} ${styles.blue}`}>
            <Search size={18} className={styles.buttonIcon} />
            Search Clients
          </Link>
          
          <Link to="/programs" className={`${styles.actionButton} ${styles.purple}`}>
            <FileText size={18} className={styles.buttonIcon} />
            Manage Programs
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users size={24} className={styles.statIcon} />}
            color="border-blue-500"
          />
          <StatCard
            title="Total Programs"
            value={stats.totalPrograms}
            icon={<Clipboard size={24} className={styles.statIcon} />}
            color="border-indigo-500"
          />
          <StatCard
            title="Active Programs"
            value={stats.activePrograms}
            icon={<CheckCircle size={24} className={styles.statIcon} />}
            color="border-green-500"
          />
          <StatCard
            title="Doctors"
            value={stats.totalDoctors}
            icon={<UserCog size={24} className={styles.statIcon} />}
            color="border-purple-500"
          />
          <StatCard
            title="Recent Clients"
            value={stats.recentClients}
            icon={<UserPlus size={24} className={styles.statIcon} />}
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