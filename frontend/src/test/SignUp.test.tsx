import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/customer/SignUp';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/auth', () => ({
  authService: {
    signup: vi.fn(),
  },
}));

const renderSignUp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SignUp Component', () => {
  it('renders signup form', () => {
    renderSignUp();
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a secure password')).toBeInTheDocument();
  });

  it('allows first name input', () => {
    renderSignUp();
    const nameInput = screen.getByPlaceholderText('John');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    expect(nameInput).toHaveValue('John');
  });

  it('allows email input', () => {
    renderSignUp();
    const emailInput = screen.getByPlaceholderText('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('allows password input', () => {
    renderSignUp();
    const passwordInput = screen.getByPlaceholderText('Create a secure password');
    fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
    expect(passwordInput).toHaveValue('Password@123');
  });

  it('has role selection', () => {
    renderSignUp();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Owner')).toBeInTheDocument();
    expect(screen.getByText('Delivery Agent')).toBeInTheDocument();
  });

  it('has create account button', () => {
    renderSignUp();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });
});
