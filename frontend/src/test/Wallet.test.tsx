import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Wallet from '../pages/customer/Wallet';

vi.mock('../api/payment', () => ({
  paymentService: {
    getWalletBalance: vi.fn(() => Promise.resolve({ balance: 0 })),
    getWalletStatements: vi.fn(() => Promise.resolve([])),
    getCustomerPayments: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../utils/session', () => ({
  requireCurrentUserId: vi.fn(() => 1),
  getCurrentUser: vi.fn(() => ({ userId: 1, email: 'test@test.com' })),
}));

vi.mock('../utils/razorpay', () => ({
  getRazorpayKeyId: vi.fn(() => 'test_key'),
  loadRazorpayScript: vi.fn(() => Promise.resolve()),
  openRazorpayCheckout: vi.fn(),
}));

const renderWallet = () => {
  return render(
    <BrowserRouter>
      <Wallet />
    </BrowserRouter>
  );
};

describe('Wallet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wallet header', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/my wallet/i)).toBeInTheDocument();
    });
  });

  it('shows wallet balance', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/quickbite balance/i)).toBeInTheDocument();
    });
  });

  it('has top up button', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/top up/i)).toBeInTheDocument();
    });
  });

  it('shows recent transactions section', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/recent transactions/i)).toBeInTheDocument();
    });
  });

  it('shows no transactions message when empty', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/no wallet transactions yet/i)).toBeInTheDocument();
    });
  });
});
