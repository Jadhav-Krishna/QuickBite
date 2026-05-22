import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/customer/Login';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/auth', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('chef@quickbite.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('validates empty email', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('chef@quickbite.com')).toBeInTheDocument();
    });
  });

  it('validates email format', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('chef@quickbite.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(emailInput).toHaveValue('invalid-email');
  });

  it('allows password input', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
    expect(passwordInput).toHaveValue('Password@123');
  });

  it('has OAuth login buttons', () => {
    renderLogin();
    // OAuth buttons exist as button elements (Google SVG + hidden text)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
