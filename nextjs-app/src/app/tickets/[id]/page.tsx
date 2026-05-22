'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  ArrowLeft,
  User,
  Calendar,
  MessageCircle,
  Tag,
  Clock,
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  severity: string;
  status: string;
  source: string;
  created_at: string;
  resolved_at: string;
  assigned_to: number;
  created_by: number;
  assignee?: User;
  creator?: User;
}

interface Comment {
  id: number;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user?: User;
}

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchTicket(token);
    fetchComments(token);
  }, [router, ticketId]);

  const fetchTicket = async (token: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTicket(data.data);
      } else {
        router.push('/tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const fetchComments = async (token: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/tickets" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">{ticket.ticket_number}</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                defaultValue={ticket.status}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{ticket.subject}</h2>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Priority</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Severity</p>
                    <span className="text-gray-900">{ticket.severity}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Category</p>
                    <span className="text-gray-900">{ticket.category}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Source</p>
                    <span className="text-gray-900">{ticket.source}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                      <Tag className="h-3 w-3 mr-1" />
                      Warranty
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({comments.length})
                </h3>

                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg px-4 py-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.user?.name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Assignment</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Assignee</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="text-gray-900">
                        {ticket.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-gray-900">
                        {ticket.creator?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {ticket.resolved_at && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">Resolved</p>
                        <p className="text-xs text-gray-500">
                          {new Date(ticket.resolved_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}