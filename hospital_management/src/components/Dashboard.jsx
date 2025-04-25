import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

// Component for displaying a stat card
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${color}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className={`text-${color.replace('border-', '')} text-2xl`}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
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
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Enrollments</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {enrollments.length > 0 ? (
            enrollments.map((enrollment, index) => (
              <li key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600">{enrollment.clientName}</div>
                  <div className="text-sm text-gray-500">{enrollment.programName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500">No recent enrollments</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Component for displaying popular programs
const PopularPrograms = ({ programs }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Popular Programs</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {programs.length > 0 ? (
            programs.map((prog, index) => (
              <li key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600">{prog.program}</div>
                  <div className="text-sm text-gray-500">{prog.count} clients enrolled</div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500">No program data available</li>
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
  const { user } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-lg font-medium text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
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
            to="/clients/new"
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PopularPrograms programs={stats.popularPrograms} />
          <RecentEnrollments enrollments={stats.recentEnrollments} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;