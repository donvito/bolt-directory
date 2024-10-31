export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  isAuthenticated: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  bolt_url: string;
  author_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  tags: string[];
  likes: { user_id: string }[];
  likes_count: number;
  user_has_liked: boolean;
} 