import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../api/auth';
import { menuService } from '../api/menu';
import { restaurantService } from '../api/restaurant';
import { orderService } from '../api/order';

global.fetch = vi.fn();

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login sends correct request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 1, email: 'test@test.com', accessToken: 'token' }),
    });

    const result = await authService.login({ email: 'test@test.com', password: 'pass' });
    expect(result.email).toBe('test@test.com');
  });

  it('signup sends correct request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: 1, email: 'test@test.com', accessToken: 'token' }),
    });

    const result = await authService.signup({
      email: 'test@test.com',
      password: 'pass',
      fullName: 'Test User',
      role: 'CUSTOMER',
    });
    expect(result.email).toBe('test@test.com');
  });

  it('isAuthenticated checks token', () => {
    expect(authService.isAuthenticated()).toBe(false);
    localStorage.setItem('accessToken', 'token');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('logout clears storage', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('user', '{}');
    authService.logout();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

describe('Menu Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllDishes fetches items', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Item 1' }],
    });

    const result = await menuService.getAllDishes();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Item 1');
  });

  it('getMenuByRestaurant fetches restaurant menu', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, restaurantId: 1 }],
    });

    const result = await menuService.getMenuByRestaurant(1);
    expect(result).toHaveLength(1);
  });

  it('searchMenuItems searches by keyword', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Pizza' }],
    });

    const result = await menuService.searchMenuItems('pizza');
    expect(result).toHaveLength(1);
  });
});

describe('Restaurant Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllRestaurants fetches active restaurants', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Restaurant 1', isActive: true }],
    });

    const result = await restaurantService.getAllRestaurants();
    expect(result).toHaveLength(1);
    expect(result[0].isActive).toBe(true);
  });

  it('getRestaurantById fetches single restaurant', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Restaurant 1' }),
    });

    const result = await restaurantService.getRestaurantById(1);
    expect(result.id).toBe(1);
  });

  it('searchRestaurants searches by keyword', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'Pizza Place' }],
    });

    const result = await restaurantService.searchRestaurants('pizza');
    expect(result).toHaveLength(1);
  });
});

describe('Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOrder sends order request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, orderNumber: 'ORD123' }),
    });

    const result = await orderService.createOrder({
      customerId: 1,
      restaurantId: 1,
      deliveryAddress: 'Test Address',
      customerPhone: '1234567890',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [],
    });
    expect(result.orderNumber).toBe('ORD123');
  });

  it('getCustomerOrders fetches customer orders', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, customerId: 1 }],
    });

    const result = await orderService.getCustomerOrders(1);
    expect(result).toHaveLength(1);
  });

  it('updateOrderStatus updates status', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'CONFIRMED' }),
    });

    const result = await orderService.updateOrderStatus('ORD123', 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
  });
});
