import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Menu from '../pages/customer/Menu';
import { CartProvider } from '../context/CartContext';

vi.mock('../api/menu', () => ({
  menuService: {
    getMenuByRestaurant: vi.fn(() => Promise.resolve([])),
    getRestaurantCategories: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getRestaurantById: vi.fn(() => Promise.resolve({
      id: 1,
      name: 'Test Restaurant',
      description: 'Test Description',
      cuisineType: 'Indian',
      rating: 4.5,
      isOpen: true,
    })),
  },
}));

const renderMenu = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Menu />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Menu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu page', async () => {
    renderMenu();
    await waitFor(() => {
      expect(screen.getByText(/menu/i)).toBeInTheDocument();
    });
  });

  it('shows under construction message', async () => {
    renderMenu();
    await waitFor(() => {
      expect(screen.getByText(/under construction/i)).toBeInTheDocument();
    });
  });
});
