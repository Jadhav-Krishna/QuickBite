import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderHistory from '../pages/customer/OrderHistory';

vi.mock('../api/order', () => ({
  orderService: {
    getCustomerOrders: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getRestaurantById: vi.fn(() => Promise.resolve({ id: 1, name: 'Test Restaurant' })),
  },
}));

vi.mock('../api/review', () => ({
  reviewService: {
    getReviewByOrder: vi.fn(() => Promise.reject()),
  },
}));

vi.mock('../utils/session', () => ({
  requireCurrentUserId: vi.fn(() => 1),
}));

const renderOrderHistory = () => {
  return render(
    <BrowserRouter>
      <OrderHistory />
    </BrowserRouter>
  );
};

describe('OrderHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header', async () => {
    renderOrderHistory();
    await waitFor(() => {
      expect(screen.getByText(/my orders/i)).toBeInTheDocument();
    });
  });

  it('shows no orders message when empty', async () => {
    renderOrderHistory();
    await waitFor(() => {
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
    });
  });

  it('shows explore message when no orders', async () => {
    renderOrderHistory();
    await waitFor(() => {
      expect(screen.getByText(/start exploring restaurants/i)).toBeInTheDocument();
    });
  });

  it('displays order count', async () => {
    renderOrderHistory();
    await waitFor(() => {
      expect(screen.getByText(/0 orders placed/i)).toBeInTheDocument();
    });
  });
});
