import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { CustomersPage } from './pages/CustomersPage';
import { BookingsPage } from './pages/BookingsPage';
import { CustomerNewPage } from './pages/CustomerNewPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<CustomerNewPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
