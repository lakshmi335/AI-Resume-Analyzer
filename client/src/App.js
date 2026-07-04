import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ResumeDetail from './pages/ResumeDetail';
import InterviewPage from './pages/InterviewPage';
import ComparePage from './pages/ComparePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><Spinner size="lg" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><Spinner size="lg" /></div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">{children}</main>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><Layout><UploadPage /></Layout></PrivateRoute>} />
        <Route path="/resume/:id" element={<PrivateRoute><Layout><ResumeDetail /></Layout></PrivateRoute>} />
        <Route path="/interview" element={<PrivateRoute><Layout><InterviewPage /></Layout></PrivateRoute>} />
        <Route path="/compare" element={<PrivateRoute><Layout><ComparePage /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
