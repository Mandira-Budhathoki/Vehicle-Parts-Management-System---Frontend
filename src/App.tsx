import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FinancialReports as AdminReports } from './pages/admin/FinancialReports';
import { StaffManagement as AdminStaff } from './pages/admin/StaffManagement';
import { PartsManagement as AdminParts } from './pages/admin/PartsManagement';
import { VendorsManagement as AdminVendors } from './pages/admin/VendorsManagement';
import { PurchaseInvoices as AdminInvoices } from './pages/admin/PurchaseInvoices';

// Staff
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { PointOfSale as StaffPOS } from './pages/staff/PointOfSale';
import { CustomerRegistration as StaffRegisterCustomer } from './pages/staff/CustomerRegistration';
import { CustomerDirectory as StaffCustomers } from './pages/staff/CustomerDirectory';
import { StaffReports } from './pages/staff/StaffReports';

// Customer
import { CustomerPortal as CustomerProfile } from './pages/customer/CustomerPortal';
import { BookAppointment as CustomerBook } from './pages/customer/BookAppointment';
import { History as CustomerHistory } from './pages/customer/History';
import { PartRequest as CustomerRequest } from './pages/customer/PartRequest';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main Application Layout Protected */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

                  {/* Admin Routes */}
                  <Route path="/admin">
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
                    <Route path="staff" element={<ProtectedRoute allowedRoles={['admin']}><AdminStaff /></ProtectedRoute>} />
                    <Route path="parts" element={<ProtectedRoute allowedRoles={['admin']}><AdminParts /></ProtectedRoute>} />
                    <Route path="vendors" element={<ProtectedRoute allowedRoles={['admin']}><AdminVendors /></ProtectedRoute>} />
                    <Route path="invoices" element={<AdminInvoices />} />
                  </Route>

                  {/* Staff Routes */}
                  <Route path="/staff">
                    <Route index element={<Navigate to="/staff/dashboard" replace />} />
                    <Route path="dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
                    <Route path="pos" element={<ProtectedRoute allowedRoles={['staff']}><StaffPOS /></ProtectedRoute>} />
                    <Route path="register-customer" element={<ProtectedRoute allowedRoles={['staff']}><StaffRegisterCustomer /></ProtectedRoute>} />
                    <Route path="customers" element={<ProtectedRoute allowedRoles={['staff']}><StaffCustomers /></ProtectedRoute>} />
                    <Route path="reports" element={<ProtectedRoute allowedRoles={['staff']}><StaffReports /></ProtectedRoute>} />
                  </Route>

                  {/* Customer Routes */}
                  <Route path="/customer">
                    <Route index element={<Navigate to="/customer/profile" replace />} />
                    <Route path="profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
                    <Route path="book" element={<ProtectedRoute allowedRoles={['customer']}><CustomerBook /></ProtectedRoute>} />
                    <Route path="history" element={<ProtectedRoute allowedRoles={['customer']}><CustomerHistory /></ProtectedRoute>} />
                    <Route path="request-parts" element={<ProtectedRoute allowedRoles={['customer']}><CustomerRequest /></ProtectedRoute>} />
                  </Route>

                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
