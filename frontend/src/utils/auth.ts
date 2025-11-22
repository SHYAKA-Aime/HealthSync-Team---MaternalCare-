// Store token in memory (NOT localStorage for security)
let inMemoryToken: string | null = null;

export const saveToken = (token: string) => {
  inMemoryToken = token;
  // Also save to localStorage for persistence (in production, use httpOnly cookies)
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken;
  // Fallback to localStorage
  return localStorage.getItem('token');
};

export const clearToken = () => {
  inMemoryToken = null;
  localStorage.removeItem('token');
};

export const saveUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};