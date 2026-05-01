import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageUpload from '../components/ImageUpload';

describe('ImageUpload', () => {
  const mockOnUpload = async () => 'test-url';

  it('renders upload button', () => {
    render(<ImageUpload onUpload={mockOnUpload} />);
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<ImageUpload onUpload={mockOnUpload} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('displays image when provided', () => {
    render(<ImageUpload currentImageUrl="test.jpg" onUpload={mockOnUpload} />);
    const img = screen.getByAltText('Preview');
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('shows change button with image', () => {
    render(<ImageUpload currentImageUrl="test.jpg" onUpload={mockOnUpload} />);
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<ImageUpload currentImageUrl="test.jpg" onUpload={mockOnUpload} />);
    const img = screen.getByAltText('Preview');
    expect(img).toHaveClass('object-cover');
  });
});
