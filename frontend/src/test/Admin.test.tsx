import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminOverview from '../pages/admin/AdminOverview';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminApprovals from '../pages/admin/AdminApprovals';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/auth', () => ({
  authService: {
    getAllUsers: vi.fn(() => Promise.resolve([])),
    suspendUser: vi.fn(() => Promise.resolve({ message: 'User suspended' })),
    reactivateUser: vi.fn(() => Promise.resolve({ message: 'User reactivated' })),
    deleteUser: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getAllRestaurantsForAdmin: vi.fn(() => Promise.resolve([])),
    approveRestaurant: vi.fn(() => Promise.resolve({ id: 1, isApproved: true })),
    toggleRestaurantActive: vi.fn(() => Promise.resolve({ id: 1, isActive: true })),
    toggleRestaurantOpen: vi.fn(() => Promise.resolve({ id: 1, isOpen: true })),
  },
}));

vi.mock('../api/payment', () => ({
  paymentService: {
    getAllPayments: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../api/delivery', () => ({
  deliveryService: {
    getAllAgents: vi.fn(() => Promise.resolve([])),
  },
}));

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Admin Overview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders platform overview header', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/platform overview/i)).toBeInTheDocument();
    });
  });

  it('displays total users metric', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/total users/i)).toBeInTheDocument();
    });
  });

  it('displays active partners metric', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/active partners/i)).toBeInTheDocument();
    });
  });

  it('displays online agents metric', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/online agents/i)).toBeInTheDocument();
    });
  });

  it('displays processed revenue metric', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/processed 30d/i)).toBeInTheDocument();
    });
  });

  it('shows operational signals section', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      const elements = screen.getAllByText(/operational signals/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('shows recent payments section', async () => {
    renderWithAuth(<AdminOverview />);
    await waitFor(() => {
      expect(screen.getByText(/recent payments/i)).toBeInTheDocument();
    });
  });
});

describe('Admin Users Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user control center header', async () => {
    renderWithAuth(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText(/user control center/i)).toBeInTheDocument();
    });
  });

  it('has search functionality', async () => {
    renderWithAuth(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name, email, or role/i)).toBeInTheDocument();
    });
  });

  it('displays user table headers', async () => {
    renderWithAuth(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText(/user profile/i)).toBeInTheDocument();
      expect(screen.getAllByText(/role/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/status/i).length).toBeGreaterThan(0);
    });
  });

  it('shows no users message when empty', async () => {
    renderWithAuth(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('allows searching users', async () => {
    renderWithAuth(<AdminUsers />);
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search by name, email, or role/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput).toHaveValue('test');
    });
  });
});

describe('Admin Approvals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders approvals center header', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      expect(screen.getByText(/approvals center/i)).toBeInTheDocument();
    });
  });

  it('has restaurants tab', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      const restaurantElements = screen.getAllByText(/restaurants/i);
      expect(restaurantElements.length).toBeGreaterThan(0);
    });
  });

  it('has delivery agents tab', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      const agentElements = screen.getAllByText(/delivery agents/i);
      expect(agentElements.length).toBeGreaterThan(0);
    });
  });

  it('has pending tab', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      const pendingButtons = screen.getAllByText(/pending/i);
      expect(pendingButtons.length).toBeGreaterThan(0);
    });
  });

  it('has approved tab', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      const approvedButtons = screen.getAllByText(/approved/i);
      expect(approvedButtons.length).toBeGreaterThan(0);
    });
  });

  it('has search functionality', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by restaurant name or city/i)).toBeInTheDocument();
    });
  });

  it('shows no restaurants message when empty', async () => {
    renderWithAuth(<AdminApprovals />);
    await waitFor(() => {
      expect(screen.getByText(/no restaurants found/i)).toBeInTheDocument();
    });
  });
});
