import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewModal from '../components/ReviewModal';

vi.mock('../api/review', () => ({
  reviewService: {
    createReview: vi.fn(),
  },
}));

const mockOrder = {
  id: 1,
  orderNumber: 'ORD123',
  customerId: 1,
  restaurantId: 1,
  status: 'DELIVERED',
  totalAmount: 500,
  deliveryCharge: 50,
  finalAmount: 550,
  deliveryAddress: 'Test Address',
  customerPhone: '1234567890',
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'PENDING',
  items: [],
  createdAt: new Date().toISOString(),
  deliveryAgentId: 1,
};

const renderReviewModal = () => {
  return render(
    <ReviewModal
      order={mockOrder}
      customerId={1}
      onClose={vi.fn()}
      onSuccess={vi.fn()}
    />
  );
};

describe('ReviewModal Component', () => {
  it('renders modal header', () => {
    renderReviewModal();
    expect(screen.getByText(/rate your experience/i)).toBeInTheDocument();
  });

  it('shows order number', () => {
    renderReviewModal();
    expect(screen.getByText(/ORD123/i)).toBeInTheDocument();
  });

  it('has restaurant rating section', () => {
    renderReviewModal();
    expect(screen.getByText(/restaurant experience/i)).toBeInTheDocument();
  });

  it('has delivery rating section', () => {
    renderReviewModal();
    expect(screen.getByText(/delivery experience/i)).toBeInTheDocument();
  });

  it('has anonymous checkbox', () => {
    renderReviewModal();
    expect(screen.getByText(/post review anonymously/i)).toBeInTheDocument();
  });

  it('has submit button', () => {
    renderReviewModal();
    expect(screen.getByText(/submit review/i)).toBeInTheDocument();
  });

  it('has cancel button', () => {
    renderReviewModal();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('allows restaurant review text input', () => {
    renderReviewModal();
    const textarea = screen.getAllByPlaceholderText(/share your experience/i)[0];
    fireEvent.change(textarea, { target: { value: 'Great food!' } });
    expect(textarea).toHaveValue('Great food!');
  });
});
