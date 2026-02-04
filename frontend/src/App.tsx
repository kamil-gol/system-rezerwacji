import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
import ReservationDetails from './pages/ReservationDetails';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/reservations/new" element={<ReservationForm />} />
        <Route path="/reservations/:id" element={<ReservationDetails />} />
        <Route path="/reservations/:id/edit" element={<ReservationForm />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/statistics" element={<Statistics />} />
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <Route path="/admin" element={<Admin />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
