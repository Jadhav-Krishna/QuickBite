export interface StoredUser {
  userId?: number;
  role?: string;
  email?: string;
  fullName?: string;
}

export const getCurrentUser = (): StoredUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

export const requireCurrentUserId = () => {
  const user = getCurrentUser();
  if (!user?.userId) {
    throw new Error('Please login to continue.');
  }

  return user.userId;
};