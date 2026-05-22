# Frontend Component Documentation

## Component Structure

```
frontend/src/
├── App.tsx              # Root component with routes
├── main.tsx             # Entry point
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Login.tsx        # Login page
│   ├── Tickets.tsx      # Ticket list view
│   ├── TicketDetail.tsx # Single ticket view
│   ├── Customers.tsx    # Customer management
│   └── Settings.tsx     # Application settings
├── components/          # Reusable components (for future)
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── services/
│   └── api.ts           # API service layer
├── hooks/               # Custom hooks (for future)
├── stores/              # State management (for future)
├── utils/
│   └── cn.ts            # Class name utility
└── constants/
    └── api.ts           # API URL constant
```

---

## Pages Documentation

### 1. App.tsx - Root Component

**Purpose**: Application entry point with routing

```typescript
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
```

**Key Features:**
- React Router for navigation
- AuthProvider for authentication context
- React Hot Toast for notifications
- PROTECTED ROUTES (should implement private route component)

---

### 2. Dashboard.tsx - Main Dashboard

**Purpose**: Overview of ticket statistics and recent tickets

#### State Management

```typescript
interface TicketStats {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
  PENDING: number;
}

const [stats, setStats] = useState<TicketStats | null>(null);
const [tickets, setTickets] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
```

#### Data Fetching

```typescript
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
```

#### UI Components

1. **Header**
   - Application title
   - Welcome message with user name
   - User info display

2. **Stat Cards** (4-column grid)
   - Open tickets
   - In Progress tickets
   - Resolved tickets
   - Closed tickets
   - Color-coded indicators

3. **Recent Tickets Table**
   - Ticket number
   - Subject
   - Status with color badges
   - Priority

#### Status Colors

```typescript
status === 'OPEN' && 'bg-blue-100 text-blue-800'
status === 'IN_PROGRESS' && 'bg-yellow-100 text-yellow-800'
status === 'RESOLVED' && 'bg-green-100 text-green-800'
status === 'CLOSED' && 'bg-gray-100 text-gray-800'
```

---

### 3. Login.tsx - Authentication Page

**Purpose**: User login form

#### State Management

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

#### Form Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await login(email, password);
    navigate('/');
  } finally {
    setIsLoading(false);
  }
};
```

#### UI Components

1. **Login Form**
   - Email input (type="email")
   - Password input (type="password")
   - Submit button with loading state
   - Validation requirements

2. **Form Validation**
   - Required fields enforced by HTML
   - Email type validation
   - Loading state disables button

---

### 4. Tickets.tsx - Ticket List

**Purpose**: Display all tickets with filtering and pagination

#### State Management

```typescript
const [tickets, setTickets] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [filters, setFilters] = useState({
  status: '',
  priority: '',
  search: '',
});
```

#### Filter Handling

```typescript
const fetchTickets = async () => {
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
};
```

#### UI Components

1. **Filter Bar**
   - Status dropdown
   - Priority dropdown
   - Search input (future)

2. **Action Button**
   - "New Ticket" button

3. **Tickets Table**
   - Ticket number (clickable link)
   - Subject
   - Status badge
   - Priority
   - Created date

4. **Pagination**
   - Previous/Next buttons
   - Entry count display

#### Status Colors Mapping

```typescript
const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-purple-100 text-purple-800',
};
```

---

### 5. TicketDetail.tsx - Single Ticket View

**Purpose**: View and manage individual ticket

#### Key Features (To Be Implemented)
- Ticket details display
- Comment thread
- Status updates
- Assignment management
- Attachment handling

---

### 6. Customers.tsx - Customer Management

**Purpose**: View and manage customers

#### Key Features (To Be Implemented)
- Customer list
- Customer details
- Ticket history per customer

---

### 7. Settings.tsx - Application Settings

**Purpose**: User and application settings

#### Key Features (To Be Implemented)
- Profile settings
- Password change
- Notification preferences
- Team management (admin only)

---

## Shared Components

### Utility Functions

#### cn.ts - Class Name Utility

```typescript
import { className } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs: classValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage**:
```typescript
<div className={cn("base-class", condition && "conditional-class")}>
```

**Benefits**:
- Merges Tailwind CSS classes
- Removes duplicates
- Handles conditional classes

---

## Context Documentation

### AuthContext.tsx - Authentication Context

**Purpose**: Global authentication state management

#### Interface Definitions

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

#### State Management

```typescript
const [state, setState] = useState<AuthState>({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
});
```

#### Authentication Flow

1. **Initialization**
   - Check for token in localStorage
   - Set axios default header
   - Fetch user profile

2. **Login**
   - Call API
   - Store token
   - Update state
   - Redirect to dashboard

3. **Logout**
   - Remove token
   - Clear axios header
   - Reset state

4. **Profile Update**
   - Call API
   - Update user in state

#### Hook Usage

```typescript
const { user, isLoading, login, logout } = useAuth();

if (isLoading) return <LoadingSpinner />;
```

---

## Services Documentation

### api.ts - API Service Layer

#### Structure

```typescript
export const api = {
  tickets: {
    getAll: (params?: any) => fetch(...),
    getById: (id: string) => fetch(...),
    create: (data: any) => fetch(...),
    update: (id: string, data: any) => fetch(...),
    delete: (id: string) => fetch(...),
    getStats: () => fetch(...),
  },
  auth: {
    login: (data: any) => fetch(...),
    register: (data: any) => fetch(...),
    getProfile: () => fetch(...),
    updateProfile: (data: any) => fetch(...),
    changePassword: (data: any) => fetch(...),
  },
  users: {
    getAll: (params?: any) => fetch(...),
    update: (id: string, data: any) => fetch(...),
  },
  channels: {
    getAll: () => fetch(...),
  },
};
```

#### Header Management

```typescript
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
```

**Features**:
- Automatic token injection
- JSON content type
- Reusable across all services

---

## Styling Guidelines

### TailwindCSS Classes Used

| Category | Classes | Purpose |
|----------|---------|---------|
| Layout | `flex`, `grid`, `container`, `mx-auto` | Layout structure |
| Spacing | `p-*`, `m-*`, `space-*` | Padding and margins |
| Typography | `text-*`, `font-*` | Text styling |
| Colors | `bg-*`, `text-*`, `border-*` | Color scheme |
| Interactive | `hover:*`, `focus:*`, `active:*` | State styles |
| Sizing | `w-*`, `h-*`, `max-w-*` | Dimensions |

### Color Palette

```typescript
// Status Colors
status === 'OPEN' && 'bg-blue-100 text-blue-800'      // Blue
status === 'IN_PROGRESS' && 'bg-yellow-100 text-yellow-800'  // Yellow
status === 'RESOLVED' && 'bg-green-100 text-green-800'  // Green
status === 'CLOSED' && 'bg-gray-100 text-gray-800'    // Gray
status === 'PENDING' && 'bg-purple-100 text-purple-800'  // Purple
```

---

## Future Enhancements

### Components to Implement

1. **PrivateRoute** - Protected route component
```typescript
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};
```

2. **TicketForm** - Create/edit ticket form
3. **CommentBox** - Add comments to tickets
4. **AttachmentList** - Show ticket attachments
5. **AssignmentModal** - Assign tickets to agents
6. **ConfirmDialog** - Confirmation for destructive actions

### Custom Hooks to Implement

1. **usePagination** - Pagination logic
2. **useLocalStorage** - Local storage with state
3. **useDebounce** - Debounce search input
4. **useApi** - API call with loading/error states