import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import TicketDetail from './pages/TicketDetail';
import Tickets from './pages/Tickets';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;