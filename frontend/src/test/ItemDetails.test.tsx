import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItemDetails from '../pages/customer/ItemDetails';
import { CartProvider } from '../context/CartContext';

vi.mock('../api/menu', () => ({
  menuService: {
    getMenuItemById: vi.fn(() => Promise.resolve({
      id: 1,
      restaurantId: 1,
      name: 'Test Item',
      description: 'Test Description',
      price: 100,
      isAvailable: true,
      isVegetarian: true,
      preparationTime: 20,
    })),
    getMenuByRestaurant: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../api/restaurant', () => ({
  restaurantService: {
    getRestaurantById: vi.fn(() => Promise.resolve({
      id: 1,
      name: 'Test Restaurant',
      cuisineType: 'Indian',
      rating: 4.5,
    })),
  },
}));

const renderItemDetails = () => {
  return render(
    <MemoryRouter initialEntries={['/item/1']}>
      <CartProvider>
        <Routes>
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
};

describe('ItemDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderItemDetails();
    expect(container).toBeInTheDocument();
  });

  it('displays item name after loading', async () => {
    const { container } = renderItemDetails();
    await waitFor(() => {
      expect(container.textContent).toContain('Test Item');
    }, { timeout: 3000 });
  });

  it('displays item description', async () => {
    const { container } = renderItemDetails();
    await waitFor(() => {
      expect(container.textContent).toContain('Test Description');
    }, { timeout: 3000 });
  });

  it('shows item price', async () => {
    const { container } = renderItemDetails();
    await waitFor(() => {
      expect(container.textContent).toContain('100');
    }, { timeout: 3000 });
  });

  it('has add to cart button', async () => {
    const { container } = renderItemDetails();
    await waitFor(() => {
      expect(container.textContent?.toLowerCase()).toContain('add to cart');
    }, { timeout: 3000 });
  });

  it('shows restaurant info', async () => {
    const { container } = renderItemDetails();
    await waitFor(() => {
      expect(container.textContent).toContain('Test Restaurant');
    }, { timeout: 3000 });
  });
});
