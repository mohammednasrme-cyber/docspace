export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface RequestWithUser {
  user: AuthenticatedUser;
}
