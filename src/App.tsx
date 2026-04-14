import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { ThemeProvider } from './core/context/ThemeContext';
import { LanguageProvider } from './core/context/LanguageContext';
import Layout from './core/layout/layout';
import LoginPage from './core/pages/LoginPage';
import DashboardPage from './core/pages/DashboardPage';
import CategoriesPage from './core/pages/CategoriesPage';
import CustomersPage from './core/pages/CustomersPage';
import ProductsPage from './core/pages/ProductsPage';
import ModifierGroupsPage from './core/pages/ModifierGroupsPage';
import OrdersPage from './core/pages/OrdersPage';
import PaymentsPage from './core/pages/PaymentsPage';
import CashbackTiersPage from './core/pages/CashbackTiersPage';
import BroadcastsPage from './core/pages/BroadcastsPage';
import OrganizationsPage from './core/pages/OrganizationsPage';
import TerminalGroupsPage from './core/pages/TerminalGroupsPage';
import PaymentTypesPage from './core/pages/PaymentTypesPage';
import SyncPage from './core/pages/SyncPage';
import StaffPage from './core/pages/StaffPage';
import AttendancePage from './core/pages/AttendancePage';
import BusinessSettingsPage from './core/pages/BusinessSettingsPage';
// import SettingsPage from './core/pages/SettingsPage';
import { Toaster } from 'sonner';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  const isAdmin = currentUser?.is_superuser || currentUser?.role === 'admin';
  
  if (!isAdmin) {
    return <Navigate to="/orders" replace />;
  }

  return <Layout>{children}</Layout>;
}

function RootRedirect() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = currentUser?.is_superuser || currentUser?.role === 'admin';
  const redirectTo = isAdmin ? '/dashboard' : '/orders';

  return <Navigate to={redirectTo} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <AdminRoute>
                      <DashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <AdminRoute>
                      <CategoriesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <AdminRoute>
                      <CustomersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <AdminRoute>
                      <ProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/modifier-groups"
                  element={
                    <AdminRoute>
                      <ModifierGroupsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <AdminRoute>
                      <PaymentsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/cashback-tiers"
                  element={
                    <AdminRoute>
                      <CashbackTiersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/broadcasts"
                  element={
                    <AdminRoute>
                      <BroadcastsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <AdminRoute>
                      <OrganizationsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/terminal-groups"
                  element={
                    <AdminRoute>
                      <TerminalGroupsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/payment-types"
                  element={
                    <AdminRoute>
                      <PaymentTypesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/sync"
                  element={
                    <AdminRoute>
                      <SyncPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <AdminRoute>
                      <StaffPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <AdminRoute>
                      <AttendancePage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/business-settings"
                  element={
                    <AdminRoute>
                      <BusinessSettingsPage />
                    </AdminRoute>
                  }
                />
                <Route path="/" element={<RootRedirect />} />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
