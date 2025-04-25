import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import Login from '../components/LoginPage';
import Dashboard from '../components/Dashboard';
import ProgramsManagement from '../components/ProgramsManagement';
import ClientList from '../components/Clientlists';
import ClientRegistration from '../components/ClientRegistration';
import ClientDetail from '../components/ClientView';
import ClientEdit from '../components/ClientEdit';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/programs" element={
        <ProtectedRoute>
          <ProgramsManagement />
        </ProtectedRoute>
      } />
      
      {/* Client routes */}
      <Route path="/clients" element={
        <ProtectedRoute>
          <ClientList />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/register" element={
        <ProtectedRoute>
          <ClientRegistration />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/new" element={
        <ProtectedRoute>
          <ClientRegistration />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/:id" element={
        <ProtectedRoute>
          <ClientDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/clients/:id/edit" element={
        <ProtectedRoute>
          <ClientEdit />
        </ProtectedRoute>
      } />
      
      <Route path="/programs/new" element={
        <ProtectedRoute>
          <ProgramsManagement isCreating={true} />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;