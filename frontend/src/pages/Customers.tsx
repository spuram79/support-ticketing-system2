import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { cn } from '../utils/cn';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.users.getAll();
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer accounts</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t">
                    <td className="py-3">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="py-3">{customer.email}</td>
                    <td className="py-3">{customer.role}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded",
                        customer.status === 'ACTIVE' && 'bg-green-100 text-green-800',
                        customer.status === 'INACTIVE' && 'bg-gray-100 text-gray-800',
                      )}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Customers;