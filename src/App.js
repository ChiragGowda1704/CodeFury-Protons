// Main App component with routing and authentication

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import ApiTest from './components/ApiTest';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import StyleTransfer from './pages/StyleTransfer';
import GameDraw from './pages/GameDraw';

// Services
import { authAPI } from './services/api';

// Styled components
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
`;

const MainContent = styled.main`
  padding-top: 80px; /* Account for fixed navbar */
  min-height: calc(100vh - 80px);
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
`;

// Protected Route component
const ProtectedRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect if logged in)
const PublicRoute = ({ children, user }) => {
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <LoadingScreen>
        <div>Loading Artist Showcase Platform...</div>
      </LoadingScreen>
    );
  }

  return (
    <Router>
      <AppContainer>
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <MainContent>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute user={user}>
                  <Login onLogin={handleLogin} />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute user={user}>
                  <Signup onLogin={handleLogin} />
                </PublicRoute>
              } 
            />
            <Route 
              path="/api-test" 
              element={<ApiTest />} 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gallery" 
              element={
                <ProtectedRoute user={user}>
                  <Gallery user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute user={user}>
                  <Upload user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/style-transfer" 
              element={
                <ProtectedRoute user={user}>
                  <StyleTransfer user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute user={user}>
                  <GameDraw user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Redirect root to appropriate page */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </MainContent>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AppContainer>
    </Router>
  );
}

export default App;
