import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../pages/customer/Cart';
import { CartProvider } from '../context/CartContext';

const renderCart = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Cart Component', () => {
  it('renders empty cart message', () => {
    renderCart();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows browse restaurants button when empty', () => {
    renderCart();
    expect(screen.getByText(/browse restaurants/i)).toBeInTheDocument();
  });

  it('displays cart header', () => {
    renderCart();
    const cartHeaders = screen.getAllByText(/your cart/i);
    expect(cartHeaders.length).toBeGreaterThan(0);
  });

  it('shows review items message', () => {
    renderCart();
    expect(screen.getByText(/review items before checkout/i)).toBeInTheDocument();
  });
});
