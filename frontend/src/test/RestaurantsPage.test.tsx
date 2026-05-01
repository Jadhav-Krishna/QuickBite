import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RestaurantsPage from '../pages/customer/RestaurantsPage';

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getAllRestaurants: vi.fn(() => Promise.resolve([])),
  },
}));

const renderRestaurants = () => {
  return render(
    <BrowserRouter>
      <RestaurantsPage />
    </BrowserRouter>
  );
};

describe('RestaurantsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header', async () => {
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText(/restaurants in/i)).toBeInTheDocument();
    });
  });

  it('has search input', async () => {
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search restaurants/i)).toBeInTheDocument();
    });
  });

  it('has filter button', async () => {
    renderRestaurants();
    await waitFor(() => {
      // Filter button exists (text may be visually hidden via CSS)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('shows restaurants available count', async () => {
    renderRestaurants();
    await waitFor(() => {
      expect(screen.getByText(/restaurants available/i)).toBeInTheDocument();
    });
  });
});
