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
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <ProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/modifier-groups"
                  element={
                    <ProtectedRoute>
                      <ModifierGroupsPage />
                    </ProtectedRoute>
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
                    <ProtectedRoute>
                      <PaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cashback-tiers"
                  element={
                    <ProtectedRoute>
                      <CashbackTiersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/broadcasts"
                  element={
                    <ProtectedRoute>
                      <BroadcastsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <ProtectedRoute>
                      <OrganizationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/terminal-groups"
                  element={
                    <ProtectedRoute>
                      <TerminalGroupsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-types"
                  element={
                    <ProtectedRoute>
                      <PaymentTypesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
