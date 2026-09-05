import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Client Pages
import Home from './features/client/Home';
import RegistrationForm from './features/client/RegistrationForm';
import FormDetails from './features/client/FormDetails';
import CheckStatus from './features/client/CheckStatus';

// Admin Pages
import AdminLogin from './features/admin/AdminLogin';
import Dashboard from './features/admin/Dashboard';
import CreateForm from './features/admin/CreateForm';
import FormsList from './features/admin/FormsList';
import FormSubmissions from './features/admin/FormSubmissions';

export function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route
            path="register/:formId"
            element={
              <ProtectedRoute>
                <RegistrationForm />
              </ProtectedRoute>
            }
          />
          <Route path="form/:formId" element={<FormDetails />} />
          <Route
            path="status"
            element={
              <ProtectedRoute>
                <CheckStatus />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateForm />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/:formId" element={<FormSubmissions />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
