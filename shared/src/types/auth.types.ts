// Authentication Types

// TODO: Define User type (what gets returned to frontend - NO password!)
export type User = {
  id: string;
  email: string;
  name: string;
  profileAvatar: string | null;
};

// TODO: Define LoginRequest type (email, password)
export type LoginRequest = {
  email: string;
  password: string;
};

// TODO: Define LoginResponse type (user + token)
export type LoginResponse = {
  user: User;
  token: string;
};

// TODO: Define RegisterRequest type (email, password, name)
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  profileAvatar?: string;
};

export type RegisterResponse = {
  user: User;
  token: string;
};
