import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PartnerDashboard from '../pages/partner/PartnerDashboard';
import PartnerOrders from '../pages/partner/PartnerOrders';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getRestaurantsByOwner: vi.fn(() => Promise.resolve([])),
    createRestaurant: vi.fn(() => Promise.resolve({ id: 1, name: 'Test Restaurant' })),
    updateRestaurant: vi.fn(() => Promise.resolve({ id: 1, name: 'Updated Restaurant' })),
    toggleRestaurantOpen: vi.fn(() => Promise.resolve({ id: 1, isOpen: true })),
    uploadRestaurantImage: vi.fn(() => Promise.resolve('http://example.com/image.jpg')),
    deleteRestaurantImage: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('../api/order', () => ({
  orderService: {
    getRestaurantOrders: vi.fn(() => Promise.resolve([])),
    confirmOrder: vi.fn(() => Promise.resolve({ id: 1, status: 'CONFIRMED' })),
    updateOrderStatus: vi.fn(() => Promise.resolve({ id: 1, status: 'PREPARING' })),
    confirmRestaurantPickup: vi.fn(() => Promise.resolve({ id: 1, restaurantPickupConfirmed: true })),
  },
}));

vi.mock('../api/delivery', () => ({
  deliveryService: {
    getAgent: vi.fn(() => Promise.resolve({ id: 1, fullName: 'Test Agent' })),
  },
}));

const mockUser = {
  userId: 1,
  email: 'partner@test.com',
  fullName: 'Test Partner',
  role: 'RESTAURANT_OWNER',
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

describe('Partner Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('renders overview header', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });
  });

  it('displays welcome message', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  it('shows revenue metric', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/revenue/i)).toBeInTheDocument();
    });
  });

  it('shows todays orders metric', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/today's orders/i)).toBeInTheDocument();
    });
  });

  it('shows active orders metric', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/active orders/i)).toBeInTheDocument();
    });
  });

  it('shows restaurant rating metric', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/restaurant rating/i)).toBeInTheDocument();
    });
  });

  it('has create restaurant button when no restaurant', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      const createButtons = screen.getAllByText(/create restaurant/i);
      expect(createButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows create restaurant prompt when no restaurant exists', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/create your restaurant first/i)).toBeInTheDocument();
    });
  });
});

describe('Partner Orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('renders order management header', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      expect(screen.getByText(/order management/i)).toBeInTheDocument();
    });
  });

  it('has refresh button', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
    });
  });

  it('displays order metrics', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      const newElements = screen.getAllByText(/^new$/i);
      expect(newElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText(/preparing/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ready/i).length).toBeGreaterThan(0);
    });
  });

  it('has live orders tab', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      const liveOrdersElements = screen.getAllByText(/live orders/i);
      expect(liveOrdersElements.length).toBeGreaterThan(0);
    });
  });

  it('has past orders tab', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      expect(screen.getByText(/past orders/i)).toBeInTheDocument();
    });
  });

  it('shows no orders message when empty', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      expect(screen.getByText(/no live orders/i)).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    renderWithAuth(<PartnerOrders />);
    await waitFor(() => {
      const pastTab = screen.getByText(/past orders/i);
      fireEvent.click(pastTab);
      expect(screen.getByText(/no past orders/i)).toBeInTheDocument();
    });
  });
});

describe('Partner Restaurant Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('can open restaurant form', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      const createButton = screen.getAllByText(/create restaurant/i)[0];
      fireEvent.click(createButton);
      expect(screen.getAllByText(/create restaurant/i).length).toBeGreaterThan(1);
    });
  });

  it('restaurant form has required fields', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      const createButton = screen.getAllByText(/create restaurant/i)[0];
      fireEvent.click(createButton);
      expect(screen.getAllByText(/restaurant name/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/primary cuisine/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/address/i).length).toBeGreaterThan(0);
    });
  });

  it('restaurant form has submit button', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      const createButton = screen.getAllByText(/create restaurant/i)[0];
      fireEvent.click(createButton);
      // Form submit button has type="submit"
      const submitBtn = document.querySelector('button[type="submit"]');
      expect(submitBtn).toBeInTheDocument();
    });
  });

  it('restaurant form has cancel button', async () => {
    renderWithAuth(<PartnerDashboard />);
    await waitFor(() => {
      const createButton = screen.getAllByText(/create restaurant/i)[0];
      fireEvent.click(createButton);
      expect(screen.getAllByText(/cancel/i).length).toBeGreaterThan(0);
    });
  });
});
