import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../pages/customer/Checkout';
import { CartProvider } from '../context/CartContext';

vi.mock('../api/address', () => ({
  addressService: {
    getAllAddresses: vi.fn(() => Promise.resolve([])),
    getCurrentLocation: vi.fn(),
    reverseGeocode: vi.fn(),
    geocodeAddress: vi.fn(),
    createAddress: vi.fn(),
  },
}));

vi.mock('../api/order', () => ({
  orderService: {
    createOrder: vi.fn(),
  },
}));

vi.mock('../api/payment', () => ({
  paymentService: {
    createCODPayment: vi.fn(),
  },
}));

const renderCheckout = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Checkout />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Checkout Component', () => {
  it('redirects to cart when empty', () => {
    renderCheckout();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows add items message when cart empty', () => {
    renderCheckout();
    expect(screen.getByText(/add items to proceed with checkout/i)).toBeInTheDocument();
  });

  it('has browse restaurants button', () => {
    renderCheckout();
    expect(screen.getByText(/browse restaurants/i)).toBeInTheDocument();
  });
});
