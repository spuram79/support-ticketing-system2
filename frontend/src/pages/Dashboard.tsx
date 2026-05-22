import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { cn } from '../utils/cn';

interface TicketStats {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
  PENDING: number;
}

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.tickets.getStats(),
          api.tickets.getAll({ limit: 10 }),
        ]);
        
        const statsData = await statsRes.json();
        const ticketsData = await ticketsRes.json();
        
        setStats(statsData.data);
        setTickets(ticketsData.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Open', value: stats?.OPEN || 0, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'In Progress', value: stats?.IN_PROGRESS || 0, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Resolved', value: stats?.RESOLVED || 0, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Closed', value: stats?.CLOSED || 0, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Support Ticketing Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.firstName || user?.email}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className={cn("p-4 rounded-lg", card.bg)}>
              <div className={cn("text-2xl font-bold", card.color)}>{card.value}</div>
              <div className="text-sm text-gray-600">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Tickets</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No tickets found</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Ticket #</th>
                    <th className="pb-2">Subject</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t">
                      <td className="py-2">{ticket.ticketNumber}</td>
                      <td className="py-2">{ticket.subject}</td>
                      <td className="py-2">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded",
                          ticket.status === 'OPEN' && 'bg-blue-100 text-blue-800',
                          ticket.status === 'IN_PROGRESS' && 'bg-yellow-100 text-yellow-800',
                          ticket.status === 'RESOLVED' && 'bg-green-100 text-green-800',
                          ticket.status === 'CLOSED' && 'bg-gray-100 text-gray-800'
                        )}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-2">{ticket.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;