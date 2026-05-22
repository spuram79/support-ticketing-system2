import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { firstName: 'Test', email: 'test@example.com' },
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the API service
vi.mock('../../services/api', () => ({
  api: {
    tickets: {
      getStats: vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ data: { OPEN: 5, IN_PROGRESS: 3, RESOLVED: 10, CLOSED: 2 } }),
      }),
      getAll: vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ data: [] }),
      }),
    },
  },
}));

// Import Dashboard after mocks
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard header', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Support Ticketing Dashboard')).toBeDefined();
  });

  it('displays welcome message with user name', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Welcome, Test/)).toBeDefined();
  });

  it('renders stat cards', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    // Check for stat card labels
    expect(screen.getByText('Open')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Resolved')).toBeDefined();
    expect(screen.getByText('Closed')).toBeDefined();
  });

  it('renders recent tickets section', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Recent Tickets')).toBeDefined();
  });
});