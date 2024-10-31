export interface User {
  username: string;
  avatarUrl: string;
  isAuthenticated: boolean;
  id: string;
  email: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  author_id: string;
  featured: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  tags?: string[];
  liked?: boolean;
  bolt_url?: string;
}