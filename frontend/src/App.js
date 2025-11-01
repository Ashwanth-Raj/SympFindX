import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PredictionProvider } from './context/PredictionContext';
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import Loading from './components/Common/Loading';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Diagnosis from './pages/Diagnosis';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard
import UserDashboard from './components/Dashboard/UserDashboard';

// Reports
import ReportList from './components/Reports/ReportList';

import { ROUTES } from './utils/constants';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  return children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-navy-950 font-roboto-slab">
      <Header />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          
          {/* Auth Routes (redirect if already authenticated) */}
          <Route 
            path={ROUTES.LOGIN} 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path={ROUTES.REGISTER} 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path={ROUTES.DASHBOARD} 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.DIAGNOSIS} 
            element={
              <ProtectedRoute>
                <Diagnosis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.REPORTS} 
            element={
              <ProtectedRoute>
                <ReportList />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PredictionProvider>
          <AppContent />
        </PredictionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;