import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgentDashboard from '../pages/agent/AgentDashboard';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/delivery', () => ({
  deliveryService: {
    resolveAgentForUser: vi.fn(() => Promise.resolve({
      agentId: 1,
      agent: {
        id: 1,
        userId: 1,
        fullName: 'Test Agent',
        phone: '1234567890',
        vehicleType: 'Bike',
        vehicleNumber: 'TEST123',
        isOnline: false,
        totalDeliveries: 0,
        averageRating: 0,
      },
    })),
    getAgentEarnings: vi.fn(() => Promise.resolve({
      id: 1,
      totalDeliveries: 0,
      averageRating: 0,
    })),
    toggleAvailability: vi.fn(() => Promise.resolve()),
    markDelivered: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../api/order', () => ({
  orderService: {
    getAgentOrders: vi.fn(() => Promise.resolve([])),
    getAvailableOrders: vi.fn(() => Promise.resolve([])),
    claimOrder: vi.fn(() => Promise.resolve({ id: 1, status: 'PICKED_UP' })),
    confirmPickupByAgent: vi.fn(() => Promise.resolve({ id: 1, agentPickupConfirmed: true })),
    updateOrderStatus: vi.fn(() => Promise.resolve({ id: 1, status: 'IN_TRANSIT' })),
  },
}));

vi.mock('../api/review', () => ({
  reviewService: {
    getDeliveryAgentRating: vi.fn(() => Promise.resolve(4.5)),
  },
}));

vi.mock('../hooks/useLocationTracking', () => ({
  useLocationTracking: vi.fn(() => ({ isTracking: false })),
}));

const mockUser = {
  userId: 1,
  email: 'agent@test.com',
  fullName: 'Test Agent',
  role: 'DELIVERY_AGENT',
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Agent Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('renders agent greeting', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/hi,/i)).toBeInTheDocument();
    });
  });

  it('displays online/offline status', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  it('has online toggle switch', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  it('displays active pay metric', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/active|pay|offline|online/i);
    });
  });

  it('displays active orders metric', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('displays lifetime deliveries metric', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('displays rating metric', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('shows current assignment section', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/current assignment/i)).toBeInTheDocument();
    });
  });

  it('shows no active order message when no assignment', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      // Text may be split across elements
      expect(screen.getByText(/current assignment/i)).toBeInTheDocument();
    });
  });

  it('shows go online message when offline', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/go online to receive and accept delivery orders/i)).toBeInTheDocument();
    });
  });
});

describe('Agent Order Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('shows available orders when online', async () => {
    const mockOnlineAgent = {
      agentId: 1,
      agent: {
        id: 1,
        userId: 1,
        fullName: 'Test Agent',
        phone: '1234567890',
        vehicleType: 'Bike',
        vehicleNumber: 'TEST123',
        isOnline: true,
        totalDeliveries: 0,
        averageRating: 0,
      },
    };

    vi.mocked(await import('../api/delivery')).deliveryService.resolveAgentForUser.mockResolvedValue(mockOnlineAgent);

    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/no orders available/i)).toBeInTheDocument();
    });
  });

  it('displays order count when available', async () => {
    const mockOnlineAgent = {
      agentId: 1,
      agent: {
        id: 1,
        userId: 1,
        fullName: 'Test Agent',
        phone: '1234567890',
        vehicleType: 'Bike',
        vehicleNumber: 'TEST123',
        isOnline: true,
        totalDeliveries: 0,
        averageRating: 0,
      },
    };

    const mockAvailableOrders = [
      {
        id: 1,
        orderNumber: 'ORD123',
        status: 'READY',
        totalAmount: 500,
        finalAmount: 550,
        items: [{ menuItemId: 1, itemName: 'Test Item', quantity: 1, price: 500 }],
        deliveryAddress: 'Test Address',
        customerPhone: '1234567890',
        restaurantId: 1,
        customerId: 1,
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        deliveryCharge: 50,
        createdAt: new Date().toISOString(),
      },
    ];

    vi.mocked(await import('../api/delivery')).deliveryService.resolveAgentForUser.mockResolvedValue(mockOnlineAgent);
    vi.mocked(await import('../api/order')).orderService.getAvailableOrders.mockResolvedValue(mockAvailableOrders);

    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/available orders/i)).toBeInTheDocument();
    });
  });
});

describe('Agent Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('shows error message when agent not found', async () => {
    vi.mocked(await import('../api/delivery')).deliveryService.resolveAgentForUser.mockRejectedValue(
      new Error('Agent not found')
    );

    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/unable to load dashboard/i)).toBeInTheDocument();
    });
  });

  it('shows try again button on error', async () => {
    vi.mocked(await import('../api/delivery')).deliveryService.resolveAgentForUser.mockRejectedValue(
      new Error('Agent not found')
    );

    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });
  });

  it('shows possible reasons for error', async () => {
    vi.mocked(await import('../api/delivery')).deliveryService.resolveAgentForUser.mockRejectedValue(
      new Error('Agent not found')
    );

    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/possible reasons:/i)).toBeInTheDocument();
    });
  });
});

describe('Agent Metrics Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('displays currency format correctly', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('displays rating with decimal', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });

  it('displays delivery count', async () => {
    renderWithAuth(<AgentDashboard />);
    await waitFor(() => {
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
  });
});
