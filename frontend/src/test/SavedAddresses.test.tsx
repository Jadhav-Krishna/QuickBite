import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SavedAddresses from '../pages/customer/SavedAddresses';

const renderSavedAddresses = () => {
  return render(
    <BrowserRouter>
      <SavedAddresses />
    </BrowserRouter>
  );
};

describe('SavedAddresses Component', () => {
  it('renders page header', () => {
    renderSavedAddresses();
    expect(screen.getByText(/my addresses/i)).toBeInTheDocument();
  });

  it('shows manage locations message', () => {
    renderSavedAddresses();
    expect(screen.getByText(/manage your delivery locations/i)).toBeInTheDocument();
  });

  it('has add new button', () => {
    renderSavedAddresses();
    expect(screen.getByText(/add new/i)).toBeInTheDocument();
  });

  it('displays saved addresses', () => {
    renderSavedAddresses();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/work/i)).toBeInTheDocument();
  });

  it('shows default badge', () => {
    renderSavedAddresses();
    expect(screen.getByText(/default/i)).toBeInTheDocument();
  });

  it('has edit and remove buttons', () => {
    renderSavedAddresses();
    expect(screen.getAllByText(/edit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/remove/i).length).toBeGreaterThan(0);
  });
});
