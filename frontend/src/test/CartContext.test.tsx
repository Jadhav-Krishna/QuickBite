import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';
import * as AuthContext from '../context/AuthContext';

vi.mock('../context/AuthContext');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <CartProvider>{children}</CartProvider>
  </BrowserRouter>
);

describe('CartContext', () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { userId: 1, email: 'test@test.com', fullName: 'Test', role: 'CUSTOMER' },
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      isAuthenticated: true,
      loading: false,
    });
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('has cart functions', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(typeof result.current.clearCart).toBe('function');
  });
});
