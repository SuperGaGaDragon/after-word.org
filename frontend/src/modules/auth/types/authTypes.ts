export type AuthUser = {
  id?: string;
  email: string;
  username: string;
};

export type AuthResponse = {
  user: AuthUser;
};
