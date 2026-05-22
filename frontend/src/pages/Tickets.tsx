import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { cn } from '../utils/cn';

const Tickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [page, filters]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await api.tickets.getAll(params);
      const data = await response.json();
      setTickets(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage support tickets</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            New Ticket
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No tickets found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Ticket #</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t hover:bg-gray-50 cursor-pointer">
                    <td className="py-3">{ticket.ticketNumber}</td>
                    <td className="py-3">{ticket.subject}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded",
                        statusColors[ticket.status] || 'bg-gray-100'
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3">{ticket.priority}</td>
                    <td className="py-3">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tickets;