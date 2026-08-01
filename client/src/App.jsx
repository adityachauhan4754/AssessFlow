import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login, Register } from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import SessionExpired from './pages/SessionExpired';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import LaunchPad from './pages/LaunchPad';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import ErrorBoundary from './ErrorBoundary';
import TakeAssessment from './pages/TakeAssessment';
import AssessmentSuccess from './pages/AssessmentSuccess';
import ProjectHistory from './pages/ProjectHistory';
import ProjectSettings from './pages/ProjectSettings';

const App = () => {
  return (
    <ErrorBoundary>
      {/* Custom toast positioning */}
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 20, right: 20 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />

      <Routes>
        {/* Auth routes (no sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/session-expired" element={<SessionExpired />} />

        {/* Dashboard routes (with sidebar layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/:id" element={<Builder />} />
          <Route path="/launchpad" element={<LaunchPad />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/project/history" element={<ProjectHistory />} />
          <Route path="/project/settings" element={<ProjectSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Standalone Assessment Routes */}
        <Route path="/launch-pad/:id/take" element={<TakeAssessment />} />
        <Route path="/launch-pad/submitted" element={<AssessmentSuccess />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
