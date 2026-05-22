import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { cn } from '../utils/cn';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.tickets.getById(id!);
      const data = await response.json();
      setTicket(data.data);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    // TODO: implement comment creation
    setNewComment('');
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!ticket) {
    return <div className="min-h-screen flex items-center justify-center">Ticket not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
              <p className="text-gray-600">{ticket.ticketNumber}</p>
            </div>
            <span className={cn(
              "px-3 py-1 text-sm rounded-full",
              statusColors[ticket.status] || 'bg-gray-100'
            )}>
              {ticket.status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow mb-4">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Ticket Details</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Description</span>
                    <p className="mt-1">{ticket.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Priority</span>
                      <p className="font-medium">{ticket.priority}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Type</span>
                      <p className="font-medium">{ticket.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Assignee</span>
                      <p className="font-medium">{ticket.assignee?.firstName || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created</span>
                      <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Comments</h2>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-4">
                    {ticket.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium">{comment.author?.firstName || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded">
                    Assign to Me
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded">
                    Change Status
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetail;