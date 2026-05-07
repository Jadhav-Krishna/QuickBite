import { API_BASE_URL } from './auth';

export interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const promoCodeService = {
  async getAllPromoCodes(): Promise<PromoCode[]> {
    return request<PromoCode[]>(`${API_BASE_URL}/v1/promo-codes`);
  },

  async getActivePromoCodes(): Promise<PromoCode[]> {
    return request<PromoCode[]>(`${API_BASE_URL}/v1/promo-codes/active`);
  },

  async getPromoCodeById(id: number): Promise<PromoCode> {
    return request<PromoCode>(`${API_BASE_URL}/v1/promo-codes/${id}`);
  },

  async getPromoCodeByCode(code: string): Promise<PromoCode> {
    return request<PromoCode>(`${API_BASE_URL}/v1/promo-codes/code/${code}`);
  },

  async createPromoCode(data: CreatePromoCodeRequest, createdBy?: number): Promise<PromoCode> {
    const url = createdBy 
      ? `${API_BASE_URL}/v1/promo-codes?createdBy=${createdBy}`
      : `${API_BASE_URL}/v1/promo-codes`;
    
    return request<PromoCode>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updatePromoCode(id: number, data: CreatePromoCodeRequest): Promise<PromoCode> {
    return request<PromoCode>(`${API_BASE_URL}/v1/promo-codes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deletePromoCode(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/v1/promo-codes/${id}`, {
      method: 'DELETE',
    });
  },

  async togglePromoCodeStatus(id: number): Promise<PromoCode> {
    return request<PromoCode>(`${API_BASE_URL}/v1/promo-codes/${id}/toggle`, {
      method: 'PUT',
    });
  },

  async validatePromoCode(code: string, orderAmount: number): Promise<PromoCode> {
    return request<PromoCode>(
      `${API_BASE_URL}/v1/promo-codes/validate?code=${code}&orderAmount=${orderAmount}`
    );
  },
};
