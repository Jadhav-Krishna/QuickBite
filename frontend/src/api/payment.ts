import { API_BASE_URL, getOptionalAuthHeader } from './auth';

export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  customerId?: number;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'INITIATED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InitiatePaymentRequest {
  orderId: number;
  customerId: number;
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET' | 'CASH_ON_DELIVERY';
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface WalletResponse {
  walletId: number;
  customerId: number;
  balance: number;
}

export interface WalletStatementDTO {
  id: number;
  walletId: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const paymentService = {
  initiatePayment(payload: InitiatePaymentRequest) {
    return request<PaymentResponse>(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getOptionalAuthHeader() },
      body: JSON.stringify(payload),
    });
  },

  verifyPayment(paymentId: string, signature: string, razorpayOrderId: string) {
    const query = new URLSearchParams({
      paymentId,
      signature,
      orderId: razorpayOrderId,
    });

    return request<PaymentResponse>(`${API_BASE_URL}/payments/verify?${query.toString()}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  markPaymentFailed(razorpayOrderId: string, reason?: string) {
    const query = new URLSearchParams({
      orderId: razorpayOrderId,
    });
    if (reason?.trim()) {
      query.append('reason', reason.trim());
    }

    return request<PaymentResponse>(`${API_BASE_URL}/payments/fail?${query.toString()}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getWalletBalance(customerId: number) {
    return request<WalletResponse>(`${API_BASE_URL}/payments/wallet/balance/${customerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  depositToWallet(customerId: number, amount: number) {
    return request<WalletResponse>(`${API_BASE_URL}/payments/wallet/deposit?customerId=${customerId}&amount=${amount}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  payFromWallet(customerId: number, orderId: number) {
    return request<PaymentResponse>(`${API_BASE_URL}/payments/wallet/pay?customerId=${customerId}&orderId=${orderId}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  payAmountFromWallet(customerId: number, amount: number, description?: string) {
    const query = new URLSearchParams({
      customerId: String(customerId),
      amount: String(amount),
    });
    if (description?.trim()) {
      query.append('description', description.trim());
    }

    return request<PaymentResponse>(`${API_BASE_URL}/payments/wallet/pay-amount?${query.toString()}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getWalletStatements(customerId: number) {
    return request<WalletStatementDTO[]>(`${API_BASE_URL}/payments/wallet/statements/${customerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getCustomerPayments(customerId: number) {
    return request<PaymentResponse[]>(`${API_BASE_URL}/payments/customer/${customerId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getAllPayments() {
    return request<PaymentResponse[]>(`${API_BASE_URL}/payments`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  getPaymentByOrderId(orderId: number) {
    return request<PaymentResponse>(`${API_BASE_URL}/payments/order/${orderId}`, {
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  refundPayment(paymentId: number, reason: string) {
    return request<PaymentResponse>(`${API_BASE_URL}/payments/refund/${paymentId}?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },

  updatePaymentStatus(paymentId: number, status: string) {
    return request<PaymentResponse>(`${API_BASE_URL}/payments/${paymentId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: {
        ...getOptionalAuthHeader(),
      },
    });
  },
};
