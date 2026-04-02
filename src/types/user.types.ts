export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  teamIds: string[];
  createdAt: string;
  timezone: string;
  isCurrentUser?: boolean;
}
